import { NEXT_PUBLIC_API_URL } from '$app/env/public';
import { cached } from './cache.ts';

const TIMEOUT_MS = 8000;

export const apiUrl = (path: string) => `${NEXT_PUBLIC_API_URL}${path}`;

/**
 * GET JSON from the API with a TTL cache. Resolves to `null` on any failure so a flaky API
 * degrades a page to its empty state rather than crashing it.
 */
export function get<T>(path: string, revalidate = 300): Promise<T | null> {
	return cached<T>(path, revalidate, async () => {
		const res = await fetch(apiUrl(path), { signal: AbortSignal.timeout(TIMEOUT_MS) });
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
	const res = await fetch(apiUrl(path), { signal: AbortSignal.timeout(TIMEOUT_MS * 2) });
	if (allowMissing && res.status === 404) return null;
	if (!res.ok) throw new Error(`${path} responded ${res.status}`);
	return res.json() as Promise<T>;
}
