import type { Insights, RangeId } from '#lib/admin/insights/types.ts';
import { audience } from './audience.ts';
import { DAY } from './fragments.ts';
import { health } from './health.ts';
import { overview } from './overview.ts';
import { technical } from './technical.ts';

const DAYS: Record<RangeId, number> = { '7d': 7, '30d': 30 };
const TTL_MS = 60_000;
const cache = new Map<RangeId, { at: number; value: Promise<Insights> }>();

export const isRange = (v: unknown): v is RangeId => v === '7d' || v === '30d';

/** The whole page's data for one range. Cached for a minute: the page is for a few editors, not the public. */
export function insights(range: RangeId): Promise<Insights> {
	const hit = cache.get(range);
	if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
	const end = Math.floor(Date.now() / 1000);
	const days = DAYS[range];
	// Whole UTC days, so the first day is not a half day that drags averages down; today is still counted so far.
	const w = { start: Math.floor(end / DAY) * DAY - days * DAY, end };
	const value = Promise.all([overview(w, days), audience(w), health(w), technical(w)]).then(([o, a, h, t]) => ({
		range,
		generatedAt: new Date().toISOString(),
		overview: o,
		audience: a,
		health: h,
		technical: t
	}));
	cache.set(range, { at: Date.now(), value });
	// A failed build must not stay cached for a minute.
	value.catch(() => cache.delete(range));
	return value;
}
