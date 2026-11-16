import { clip, log } from '#lib/server/log.ts';
import { clientReports, vitals } from '#lib/server/metrics.ts';
import { currentVisitorIp } from '#lib/server/request-context.ts';
import type { RequestHandler } from './$types';

/**
 * Where browsers report what only they can see (`#lib/telemetry.ts`): uncaught errors, failed API calls
 * and how fast the page felt. Errors and failed calls become log lines (`logger: web.client`); the timings
 * become histograms on `/api/metrics`, plus a log line when a page was poor for someone.
 *
 * Anyone can post here, so everything is bounded: body size, events per body, field lengths, and
 * reports per address per minute. Nothing from the body is trusted beyond being text or a number.
 */
const MAX_BODY = 16 * 1024;
const MAX_EVENTS = 20;
const PER_MINUTE = 60;

const seen = new Map<string, { n: number; until: number }>();

function allow(ip: string): boolean {
	const now = Date.now();
	if (seen.size > 5000) for (const [k, v] of seen) if (v.until < now) seen.delete(k);
	const s = seen.get(ip);
	if (!s || s.until < now) {
		seen.set(ip, { n: 1, until: now + 60_000 });
		return true;
	}
	return ++s.n <= PER_MINUTE;
}

/** A SvelteKit route id (`/[locale=locale]/(public)/bayan/[id]`) and nothing else: it becomes a metric label. */
const routeLabel = (v: unknown) => (typeof v === 'string' && /^\/[\w\-/[\]().=]{0,120}$/.test(v) ? v : 'other');
const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max ? v : undefined);

/** Past these a page was "poor" by the Core Web Vitals thresholds: worth a log line naming the page. */
const POOR = { lcp: 4, inp: 0.5, cls: 0.25 };

function record(e: Record<string, unknown>, ua: string | undefined) {
	const base = { page: clip(e.url, 400), route: routeLabel(e.route), ua };
	switch (e.t) {
		case 'error':
			clientReports.inc(['error']);
			return log('error', 'web.client', 'browser error', { ...base, source: clip(e.src, 20), error: clip(e.msg, 500), stack: clip(e.stack, 3000) });
		case 'api':
			clientReports.inc(['api']);
			// `api_request_id` is the API's `TraceId` for the failed call.
			return log('error', 'web.client', 'browser api call failed', {
				...base,
				path: clip(e.path, 300),
				method: clip(e.method, 10),
				status: num(e.status, 999),
				api_request_id: clip(e.rid, 64)
			});
		case 'vitals': {
			clientReports.inc(['vitals']);
			const v = { ttfb: num(e.ttfb, 120), fcp: num(e.fcp, 120), lcp: num(e.lcp, 120), inp: num(e.inp, 120), cls: num(e.cls, 100) };
			for (const [name, value] of Object.entries(v)) if (value !== undefined) vitals[name as keyof typeof v].observe(value, [base.route]);
			if ((v.lcp ?? 0) > POOR.lcp || (v.inp ?? 0) > POOR.inp || (v.cls ?? 0) > POOR.cls) {
				log('warn', 'web.client', 'poor page experience', { ...base, ...v, connection: clip(e.conn, 12) });
			}
			return;
		}
	}
}

export const POST: RequestHandler = async ({ request }) => {
	if (!allow(currentVisitorIp() ?? 'unknown')) return new Response(null, { status: 429 });
	const text = await request.text().catch(() => '');
	if (!text || text.length > MAX_BODY) return new Response(null, { status: 400 });
	let body: unknown;
	try {
		body = JSON.parse(text);
	} catch {
		return new Response(null, { status: 400 });
	}
	const events = Array.isArray((body as { events?: unknown })?.events) ? (body as { events: unknown[] }).events : [];
	const ua = clip(request.headers.get('user-agent'), 250);
	for (const e of events.slice(0, MAX_EVENTS)) if (e && typeof e === 'object') record(e as Record<string, unknown>, ua);
	return new Response(null, { status: 204 });
};
