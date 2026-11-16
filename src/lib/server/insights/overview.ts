import type { Overview, Point } from '#lib/admin/insights/types.ts';
import { DAY, HUMAN, PAGE, SITE, day } from './fragments.ts';
import { num, promql, sql, type Window } from './openobserve.ts';

/**
 * Real readers cannot be counted exactly: scrapers copy a browser's name and mobile users change address.
 * Two honest bounds are computed per day instead:
 *  - low:  visitors who opened at least two pages that day (scrapers mostly fetch one);
 *  - high: every visitor from Bangladesh plus the two-page visitors from elsewhere.
 * The headline is their midpoint. The access log overcounts by several times, so the raw count is not shown here.
 */
interface DayRow {
	x: string;
	engaged: number;
	bd: number;
	engaged_other: number;
	pages: number;
}

const perDay = (w: Window) =>
	sql<DayRow>(
		`select x, count(*) filter (where n >= 2) as engaged, count(*) filter (where c = 'BD') as bd,
		        count(*) filter (where n >= 2 and c <> 'BD') as engaged_other, sum(n) as pages
		 from (select histogram(_timestamp, '1 day') as x, ip || ua as k, max(country) as c, count(*) as n
		       ${SITE} and ${HUMAN} and ${PAGE} group by x, k)
		 group by x order by x`,
		w,
		400
	);

const mean = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

/** Today (UTC) is still filling up, so it would drag the average down. */
function summarise(rows: DayRow[], now: number) {
	const today = new Date(now * 1000).toISOString().slice(0, 10);
	const full = rows.filter((r) => day(r.x) < today);
	const use = full.length ? full : rows;
	const low = mean(use.map((r) => num(r.engaged)));
	const high = mean(use.map((r) => num(r.bd) + num(r.engaged_other)));
	return {
		low,
		high: Math.max(high, low),
		mid: Math.round((low + Math.max(high, low)) / 2),
		bd: mean(use.map((r) => num(r.bd))),
		pages: rows.reduce((a, r) => a + num(r.pages), 0)
	};
}

export async function overview(w: Window, days: number): Promise<Overview> {
	const before: Window = { start: w.start - days * DAY, end: w.start };
	const [rows, prevRows, loads] = await Promise.all([perDay(w), perDay(before), promql(`sum(increase(ij_web_client_reports_total{kind="vitals"}[${w.end - w.start}s]))`, w.end)]);
	const now = summarise(rows, w.end);
	const prev = prevRows.length >= Math.min(days, 3) ? summarise(prevRows, w.start) : null;
	const series = (f: (r: DayRow) => number): Point[] => rows.map((r) => ({ x: day(r.x), y: f(r) }));
	return {
		readers: { mid: now.mid, low: now.low, high: now.high },
		previous: prev && { mid: prev.mid, pageViews: prev.pages },
		pageViews: now.pages,
		bangladeshVisitors: now.bd,
		browserLoads: loads === null ? null : Math.round(loads),
		readersByDay: series((r) => Math.round((num(r.engaged) + num(r.bd) + num(r.engaged_other)) / 2)),
		pageViewsByDay: series((r) => num(r.pages))
	};
}
