import type { Check, Health, Level, Point } from '#lib/admin/insights/types.ts';
import { DAY, SITE, day } from './fragments.ts';
import { num, promql, sql, type Window } from './openobserve.ts';

const worst = (levels: Level[]): Level => (levels.includes('bad') ? 'bad' : levels.includes('warn') ? 'warn' : 'ok');
const grade = (v: number, warnAt: number, badAt: number, higherIsWorse = true): Level =>
	higherIsWorse ? (v >= badAt ? 'bad' : v >= warnAt ? 'warn' : 'ok') : v <= badAt ? 'bad' : v <= warnAt ? 'warn' : 'ok';

/** "Is the site OK?" in a handful of checks each graded green, amber or red; the page words them. */
export async function health(w: Window): Promise<Health> {
	const last24: Window = { start: w.end - DAY, end: w.end };
	const lastBackup: Window = { start: w.end - 26 * 3600, end: w.end };
	const [web, speed, api, errors, host, backups, firstSeen, browserErrors, up] = await Promise.all([
		sql<{ total: number; errors: number }>(`select count(*) as total, count(*) filter (where status >= 500) as errors ${SITE}`, last24, 1),
		sql<{ p95: number }>(`select approx_percentile_cont(duration, 0.95) as p95 ${SITE} and accept like '%text/html%'`, last24, 1),
		sql<{ total: number; errors: number }>(`select count(*) as total, count(*) filter (where status >= 500) as errors from api_http where category = 'HTTP'`, last24, 1),
		sql<{ x: string; n: number }>(
			`select x, sum(n) as n from (
			   select histogram(_timestamp, '1 day') as x, count(*) as n ${SITE} and status >= 500 group by x
			   union all select histogram(_timestamp, '1 day') as x, count(*) as n from api_http where category = 'HTTP' and status >= 500 group by x) group by x order by x`,
			w,
			200
		),
		sql<{ disk_pct: number; mem_avail_pct: number }>(`select disk_pct, mem_avail_pct from host_check where kind = 'hostcheck' order by _timestamp desc limit 1`, last24, 1),
		sql<{ n: number }>(`select count(*) as n from journal where unit = 'ij-backup.service' and message like '%backup ok%'`, lastBackup, 1),
		// When this monitoring began: before it has watched a full backup cycle, "no backup seen" proves nothing.
		sql<{ first: number }>(`select min(_timestamp) as first from host_check`, { start: w.end - 90 * DAY, end: w.end }, 1),
		sql<{ n: number }>(`select count(*) as n from web_app where level = 'error' and logger = 'web.client'`, last24, 1),
		promql('min(up{job=~"ij-api|ij-web"})', w.end)
	]);

	const pct = (r?: { total: number; errors: number }) => (r && num(r.total) ? (100 * num(r.errors)) / num(r.total) : 0);
	const checks: Check[] = [];
	const add = (id: string, level: Level, value: string) => checks.push({ id, level, value });

	add('services', up === null ? 'warn' : up >= 1 ? 'ok' : 'bad', up === null ? '?' : up >= 1 ? 'up' : 'down');
	add('siteErrors', grade(pct(web[0]), 0.5, 2), `${pct(web[0]).toFixed(2)} %`);
	add('apiErrors', grade(pct(api[0]), 0.5, 2), `${pct(api[0]).toFixed(2)} %`);
	const p95 = num(speed[0]?.p95);
	add('speed', grade(p95, 1, 2.5), `${Math.round(p95 * 1000)} ms`);
	if (host[0]) {
		add('disk', grade(num(host[0].disk_pct), 75, 90), `${Math.round(num(host[0].disk_pct))} %`);
		add('memory', grade(num(host[0].mem_avail_pct), 20, 10, false), `${Math.round(num(host[0].mem_avail_pct))} %`);
	}
	const seen = num(backups[0]?.n) > 0;
	const watchedLongEnough = num(firstSeen[0]?.first) > 0 && w.end * 1e6 - num(firstSeen[0]?.first) > 26 * 3600 * 1e6;
	add('backup', seen ? 'ok' : watchedLongEnough ? 'bad' : 'warn', seen ? 'ok' : watchedLongEnough ? 'missing' : '?');
	add('browserErrors', grade(num(browserErrors[0]?.n), 10, 50), String(num(browserErrors[0]?.n)));

	// Days without a single error have no row at all; fill them in as zero so the line does not skip over them.
	const byDay = new Map(errors.map((r) => [day(r.x), num(r.n)]));
	const errorsByDay: Point[] = [];
	for (let t = w.start; t <= w.end; t += DAY) {
		const d = new Date(t * 1000).toISOString().slice(0, 10);
		errorsByDay.push({ x: d, y: byDay.get(d) ?? 0 });
	}
	return { level: worst(checks.map((c) => c.level)), checks, errorsByDay };
}
