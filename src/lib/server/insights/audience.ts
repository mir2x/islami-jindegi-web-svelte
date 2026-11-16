import type { Audience, Slice } from '#lib/admin/insights/types.ts';
import { HUMAN, PAGE, readable, SITE } from './fragments.ts';
import { num, sql, type Window } from './openobserve.ts';

const toSlices = (rows: { label?: unknown; value?: unknown }[]): Slice[] => rows.map((r) => ({ label: String(r.label ?? ''), value: num(r.value) }));

/**
 * Who the readers are, counted over visitors who opened four or more pages in the period. Scrapers that pose as
 * browsers mostly fetch one to three pages, so this is a cleaner sample of real readers than all traffic; it shows
 * the make-up of the readership, not its size (overview.ts estimates that).
 */
const MIN_PAGES = 4;
const byTrait = (col: string, w: Window, limit = 8) =>
	sql(
		`select label, count(*) as value from (select max(${col}) as label, count(*) as n
		   ${SITE} and ${HUMAN} and ${PAGE} group by ip || ua) where n >= ${MIN_PAGES} and label <> '' group by label order by value desc limit ${limit}`,
		w,
		limit
	).then(toSlices);

export async function audience(w: Window): Promise<Audience> {
	const [countries, devices, browsers, systems, languages, referrers, pages] = await Promise.all([
		byTrait('country', w, 10),
		byTrait('device', w, 4),
		byTrait('browser', w, 6),
		byTrait('os', w, 6),
		byTrait('lang', w, 3),
		sql(
			`select referer_host as label, count(*) as value ${SITE} and ${HUMAN} and ${PAGE} and referer_host <> ''
			 and referer_host not like '%islamijindegi.com' group by referer_host order by value desc limit 8`,
			w,
			8
		).then(toSlices),
		sql(`select path as label, count(*) as value ${SITE} and ${HUMAN} and ${PAGE} and status = 200 group by path order by value desc limit 10`, w, 10).then((r) =>
			toSlices(r).map((p) => ({ ...p, label: readable(p.label) }))
		)
	]);
	return { countries, devices, browsers, systems, languages, referrers, pages };
}
