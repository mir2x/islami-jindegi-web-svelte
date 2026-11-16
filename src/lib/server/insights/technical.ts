import type { Slice, Technical } from '#lib/admin/insights/types.ts';
import { PROBE, readable, SITE } from './fragments.ts';
import { num, sql, type Window } from './openobserve.ts';

const slices = (rows: { label?: unknown; value?: unknown }[]): Slice[] => rows.map((r) => ({ label: readable(String(r.label ?? '')), value: num(r.value) }));
const top = (label: string, where: string, w: Window, agg = 'count(*)', order = 'value') =>
	sql(`select ${label} as label, ${agg} as value ${SITE} and ${where} group by label order by ${order} desc limit 8`, w, 8).then(slices);

/** Everything for the engineer: crawlers, scanners, noise and failures. Not meant for editors. */
export async function technical(w: Window): Promise<Technical> {
	const [totals, slow, missing, scanners, crawlers, noisy, classes, failures] = await Promise.all([
		sql<{ total: number; bots: number; probes: number; missing: number }>(
			`select count(*) as total, count(*) filter (where is_bot) as bots, count(*) filter (where ${PROBE}) as probes, count(*) filter (where status = 404) as missing ${SITE}`,
			w,
			1
		),
		top('path', "accept like '%text/html%' and status = 200", w, 'round(avg(duration) * 1000)').then((r) => r),
		top('path', 'status = 404', w),
		top('path', PROBE, w),
		top('substr(ua, 1, 70)', 'is_bot', w),
		top("ip || ' · ' || country", 'status >= 400', w),
		top("substr(cast(status as varchar), 1, 1) || 'xx'", 'true', w),
		sql<{ _timestamp: number; status: number; method: string; uri: string; country: string; ip: string }>(
			`select _timestamp, status, method, uri, country, ip ${SITE} and status >= 500 order by _timestamp desc limit 20`,
			w,
			20
		)
	]);
	const t = totals[0];
	return {
		botShare: t && num(t.total) ? Math.round((1000 * num(t.bots)) / num(t.total)) / 10 : 0,
		botRequests: num(t?.bots),
		scannerProbes: num(t?.probes),
		notFound: num(t?.missing),
		slowPages: slow,
		missing,
		scanners,
		crawlers,
		noisyIps: noisy,
		statusClasses: classes,
		recentFailures: failures.map((f) => ({
			time: new Date(num(f._timestamp) / 1000).toISOString(),
			status: num(f.status),
			method: String(f.method),
			uri: readable(String(f.uri)).slice(0, 200),
			country: String(f.country),
			ip: String(f.ip)
		}))
	};
}
