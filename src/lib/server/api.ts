import { API_INTERNAL_URL } from '$app/env/private';
import { NEXT_PUBLIC_API_URL } from '$app/env/public';
import { cached } from './cache.ts';
import { currentVisitorIp } from './client-ip.ts';

const TIMEOUT_MS = 8000;

/** Server-side base URL: the internal one when configured, so API calls skip the public edge. */
export const apiUrl = (path: string) => `${API_INTERNAL_URL || NEXT_PUBLIC_API_URL}${path}`;

/**
 * Over the internal URL the API sees the web server as the caller, so every visitor would share one
 * rate-limit bucket. Naming the visitor (the API's `x-client-ip`) keeps the limit per visitor.
 */
const apiHeaders = (): HeadersInit => {
	const ip = API_INTERNAL_URL ? currentVisitorIp() : undefined;
	return ip ? { 'x-client-ip': ip } : {};
};

/**
 * GET JSON from the API with a TTL cache. Resolves to `null` on any failure so a flaky API
 * degrades a page to its empty state rather than crashing it.
 */
export function get<T>(path: string, revalidate = 300): Promise<T | null> {
	return cached<T>(path, revalidate, async () => {
		const res = await fetch(apiUrl(path), { headers: apiHeaders(), signal: AbortSignal.timeout(TIMEOUT_MS) });
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
	const res = await fetch(apiUrl(path), { headers: apiHeaders(), signal: AbortSignal.timeout(TIMEOUT_MS * 2) });
	if (allowMissing && res.status === 404) return null;
	if (!res.ok) throw new Error(`${path} responded ${res.status}`);
	return res.json() as Promise<T>;
}
