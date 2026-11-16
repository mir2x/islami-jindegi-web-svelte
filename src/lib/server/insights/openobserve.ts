import { O2_PASS, O2_URL, O2_USER } from '$app/env/private';

/**
 * A minimal OpenObserve client for the Insights page. Only the server calls it, with a login the browser
 * never sees, and only with the fixed queries in this folder (nothing from a request reaches the SQL).
 */
const TIMEOUT_MS = 20_000;

export const configured = () => Boolean(O2_URL && O2_USER && O2_PASS);

const headers = () => ({ authorization: 'Basic ' + Buffer.from(`${O2_USER}:${O2_PASS}`).toString('base64'), 'content-type': 'application/json' });

export interface Window {
	/** Epoch seconds. */
	start: number;
	end: number;
}

/** Rows of one SQL query over a window; a stream that does not exist yet gives no rows. */
export async function sql<T = Record<string, never>>(query: string, w: Window, size = 100): Promise<T[]> {
	const res = await fetch(`${O2_URL}/api/default/_search?type=logs&use_cache=false`, {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify({ query: { sql: query, start_time: w.start * 1e6, end_time: w.end * 1e6, from: 0, size } }),
		signal: AbortSignal.timeout(TIMEOUT_MS)
	});
	if (res.status === 400) return [];
	if (!res.ok) throw new Error(`OpenObserve ${res.status}`);
	return ((await res.json()) as { hits?: T[] }).hits ?? [];
}

/** One value of a PromQL query at a moment, or null when the series does not exist. */
export async function promql(query: string, at: number): Promise<number | null> {
	const url = `${O2_URL}/api/default/prometheus/api/v1/query?${new URLSearchParams({ query, time: String(at) })}`;
	const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(TIMEOUT_MS) });
	if (!res.ok) return null;
	const data = (await res.json()) as { data?: { result?: { value: [number, string] }[] } };
	const v = data.data?.result?.[0]?.value?.[1];
	return v === undefined || Number.isNaN(Number(v)) ? null : Number(v);
}

/** Readable text for a number the SQL may return as a number or a string. */
export const num = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0) || 0);
