/**
 * In-process stale-while-revalidate cache, the SvelteKit stand-in for Next's `fetch(..., { next: { revalidate } })`.
 *
 * - Fresh entries are returned straight away.
 * - Expired entries are still returned (stale) while one background refresh runs, so no visitor
 *   waits on the API after the first request.
 * - Concurrent misses for the same key share one in-flight request.
 * - A failed refresh keeps serving the stale value instead of an error.
 */
interface Entry<T> {
	value: T;
	freshUntil: number;
}

const MAX_ENTRIES = 2000;
/** How long past its TTL a value may still be served while a refresh is retried. */
const STALE_FACTOR = 20;

const store = new Map<string, Entry<unknown> & { staleUntil: number }>();
const inflight = new Map<string, Promise<unknown>>();

function remember<T>(key: string, value: T, ttlMs: number) {
	// Map iterates in insertion order, so the first key is the oldest.
	if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value as string);
	const now = Date.now();
	store.delete(key);
	store.set(key, { value, freshUntil: now + ttlMs, staleUntil: now + ttlMs * STALE_FACTOR });
}

function refresh<T>(key: string, ttlMs: number, load: () => Promise<T | null>): Promise<T | null> {
	const pending = inflight.get(key) as Promise<T | null> | undefined;
	if (pending) return pending;
	const run = load()
		.then((value) => {
			if (value !== null) remember(key, value, ttlMs);
			return value;
		})
		.catch(() => null)
		.finally(() => inflight.delete(key));
	inflight.set(key, run);
	return run;
}

export async function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T | null>): Promise<T | null> {
	const ttlMs = ttlSeconds * 1000;
	const hit = store.get(key) as (Entry<T> & { staleUntil: number }) | undefined;
	const now = Date.now();
	if (hit && now < hit.freshUntil) return hit.value;
	if (hit && now < hit.staleUntil) {
		void refresh(key, ttlMs, load);
		return hit.value;
	}
	return refresh(key, ttlMs, load);
}

/** Drops every cached value (and any in-flight load), so the next request reads the API afresh. */
export function clearCache() {
	store.clear();
	inflight.clear();
}
