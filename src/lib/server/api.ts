import { API_INTERNAL_URL } from '$app/env/private';
import { PUBLIC_API_URL } from '$app/env/public';
import { cached } from './cache.ts';
import { clip, log } from './log.ts';
import { apiCalls, apiDuration } from './metrics.ts';
import { currentContext } from './request-context.ts';

const TIMEOUT_MS = 8000;
/** An API call this slow is logged even when it succeeds. */
const SLOW_MS = 1000;

/** Server-side base URL: the internal one when configured, so API calls skip the public edge. */
export const apiUrl = (path: string) => `${API_INTERNAL_URL || PUBLIC_API_URL}${path}`;

/**
 * Over the internal URL the API sees the web server as the caller, so every visitor would share one
 * rate-limit bucket. Naming the visitor (the API's `x-client-ip`) keeps the limit per visitor. The
 * request id rides along so the API logs this call under the page load's own id (over the public URL
 * nginx replaces it with its own; the API's answer names the id it used either way).
 */
const apiHeaders = (): HeadersInit => {
	const ctx = currentContext();
	const headers: Record<string, string> = {};
	if (ctx && API_INTERNAL_URL && ctx.ip) headers['x-client-ip'] = ctx.ip;
	if (ctx) headers['x-request-id'] = ctx.requestId;
	return headers;
};

/**
 * One timed API call: counted, added to the request's own total, and logged when it fails or is slow
 * (never when it simply answers 404, which pages treat as "no such item").
 */
async function call(path: string, timeoutMs: number): Promise<Response> {
	const ctx = currentContext();
	const start = performance.now();
	let res: Response | undefined;
	let failure: unknown;
	try {
		res = await fetch(apiUrl(path), { headers: apiHeaders(), signal: AbortSignal.timeout(timeoutMs) });
	} catch (e) {
		failure = e;
	}
	const ms = performance.now() - start;
	const timedOut = (failure as Error | undefined)?.name === 'TimeoutError';
	const result = res ? (res.status >= 500 ? 'error' : res.status >= 400 ? 'rejected' : 'ok') : timedOut ? 'timeout' : 'unreachable';
	apiCalls.inc([result]);
	apiDuration.observe(ms / 1000);
	const bad = !res || res.status >= 500 || (res.status >= 400 && res.status !== 404);
	if (ctx) {
		ctx.api.calls++;
		ctx.api.ms += ms;
		if (bad) ctx.api.failed++;
	}
	if (bad || ms >= SLOW_MS) {
		log(bad ? 'error' : 'warn', 'web.api', bad ? 'api call failed' : 'slow api call', {
			path: clip(path, 300),
			result,
			status: res?.status,
			duration: Math.round(ms) / 1000,
			// The id the API logged this call under (its `TraceId`).
			api_request_id: res?.headers.get('x-request-id') ?? undefined,
			error: failure ? clip(String(failure), 300) : undefined
		});
	}
	if (!res) throw failure;
	return res;
}

/**
 * GET JSON from the API with a TTL cache. Resolves to `null` on any failure so a flaky API
 * degrades a page to its empty state rather than crashing it.
 */
export function get<T>(path: string, revalidate = 300): Promise<T | null> {
	return cached<T>(path, revalidate, async () => {
		const res = await call(path, TIMEOUT_MS);
		return res.ok ? ((await res.json()) as T) : null;
	});
}

/**
 * Strict GET for the sitemap: any non-2xx throws (a 404 resolves to null only when `allowMissing`),
 * so a failing API can never produce a silently truncated sitemap.
 */
export async function getStrict<T>(path: string, allowMissing: true): Promise<T | null>;
export async function getStrict<T>(path: string): Promise<T>;
export async function getStrict<T>(path: string, allowMissing?: boolean): Promise<T | null> {
	const res = await call(path, TIMEOUT_MS * 2);
	if (allowMissing && res.status === 404) return null;
	if (!res.ok) throw new Error(`${path} responded ${res.status}`);
	return res.json() as Promise<T>;
}
