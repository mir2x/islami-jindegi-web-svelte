import { NEXT_PUBLIC_API_URL } from '$app/env/public';
import { auth } from './auth.svelte.ts';

/** Carries the HTTP status so callers can act on it; 409 in particular means a duplicate title. */
export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const token = auth.peekToken();
	const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
		...options,
		headers: { ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
	});
	if (res.status === 401) auth.clear();

	if (!res.ok) {
		// The API returns { message } for conflicts and validation failures; fall back to the raw body.
		const body = await res.text();
		let message = body;
		try {
			const parsed = JSON.parse(body);
			if (parsed?.message) message = parsed.message;
		} catch {
			/* not JSON: keep the raw text */
		}
		throw new ApiError(res.status, message || `API error ${res.status}`);
	}

	// 204 and empty bodies would blow up res.json().
	if (res.status === 204) return undefined as T;
	const text = await res.text();
	return (text ? JSON.parse(text) : undefined) as T;
}

const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });

export const api = {
	get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
	post: <T = void>(path: string, body?: unknown) => request<T>(path, json('POST', body ?? {})),
	put: <T = void>(path: string, body: unknown) => request<T>(path, json('PUT', body)),
	patch: <T = void>(path: string, body: unknown) => request<T>(path, json('PATCH', body)),
	delete: (path: string) => request<void>(path, { method: 'DELETE' })
};

/** Query string from a params object; undefined / null / '' values are skipped. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
	return q.toString();
}
