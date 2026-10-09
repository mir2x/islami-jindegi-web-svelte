import { NEXT_PUBLIC_API_URL } from '$app/env/public';
import type { FilterOption } from './filters.ts';

/** Browser-side GET against the API. Resolves to null on any failure; callers degrade to an empty state. */
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T | null> {
	try {
		const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, { signal });
		return res.ok ? ((await res.json()) as T) : null;
	} catch {
		return null;
	}
}

/** Live search over an author/category option endpoint (for the mobile picker). */
export async function fetchOptions(path: string, search: string, label: 'name' | 'title'): Promise<FilterOption[]> {
	const q = new URLSearchParams({ published: 'true' });
	if (search) q.set('search', search);
	const raw = (await apiGet<Record<string, string | number>[]>(`${path}?${q}`)) ?? [];
	return raw.map((o) => ({ id: String(o.id), label: String(o[label]), count: Number(o.count) }));
}

/** Browser-side POST of a JSON body; null on any failure. */
export async function apiPost<T>(path: string, body: unknown): Promise<T | null> {
	try {
		const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
		return res.ok ? ((await res.json()) as T) : null;
	} catch {
		return null;
	}
}
