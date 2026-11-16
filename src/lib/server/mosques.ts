import type { Mosque } from '#lib/types/mosques.ts';
import { cached } from './cache.ts';

/**
 * Mosques near a point, from OpenStreetMap through the public Overpass servers. The query is made here and
 * not in the visitor's browser so their position is never sent to a third party, results are shared by
 * everyone near the same spot, and an overloaded server is retried on the next one (the same list the app uses).
 */
const ENDPOINTS = [
	'https://overpass-api.de/api/interpreter',
	'https://overpass.openstreetmap.fr/api/interpreter',
	'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
	'https://overpass.private.coffee/api/interpreter'
];

type Tags = Record<string, unknown>;

export function parse(element: Record<string, unknown>): Mosque | null {
	const id = String(element.id ?? '');
	const center = (element.center ?? {}) as { lat?: unknown; lon?: unknown };
	const lat = element.lat ?? center.lat;
	const lng = element.lon ?? center.lon;
	if (!id || typeof lat !== 'number' || typeof lng !== 'number') return null;
	const tags = (element.tags ?? {}) as Tags;
	const tag = (k: string) => (typeof tags[k] === 'string' ? (tags[k] as string).trim() : '');
	const first = (...keys: string[]) => keys.map(tag).find(Boolean) ?? '';
	const address = tag('addr:full') || [[tag('addr:housenumber'), tag('addr:street')].filter(Boolean).join(' '), tag('addr:suburb'), tag('addr:city')].filter(Boolean).join(', ');
	return {
		id: `${element.type ?? 'unknown'}-${id}`,
		lat,
		lng,
		name: tag('name'),
		nameBn: tag('name:bn'),
		nameEn: tag('name:en'),
		address,
		phone: first('phone', 'contact:phone'),
		website: first('website', 'contact:website'),
		hours: tag('opening_hours'),
		women: tag('female') === 'yes' || tag('women') === 'yes'
	};
}

/** The server that answered last goes first next time: the main one is often overloaded and would cost every lookup its timeout. */
let lastGood = 0;
const ATTEMPT_MS = 8000;

async function query(around: string): Promise<Mosque[] | null> {
	const ql = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${around});way["amenity"="place_of_worship"]["religion"="muslim"](around:${around});relation["amenity"="place_of_worship"]["religion"="muslim"](around:${around}););out center;`;
	for (let i = 0; i < ENDPOINTS.length; i++) {
		const at = (lastGood + i) % ENDPOINTS.length;
		try {
			const res = await fetch(`${ENDPOINTS[at]}?data=${encodeURIComponent(ql)}`, { headers: { 'user-agent': 'islamijindegi.com' }, signal: AbortSignal.timeout(ATTEMPT_MS) });
			if (!res.ok) continue;
			const data = (await res.json()) as { elements?: Record<string, unknown>[] };
			if (!Array.isArray(data.elements)) continue;
			lastGood = at;
			return data.elements.map(parse).filter((m): m is Mosque => m !== null);
		} catch {
			/* try the next server */
		}
	}
	return null;
}

/**
 * Centres are rounded to ~1 km cells (and the search widened by that much) so visitors in one area share an
 * answer. Mosques move rarely: a day is fresh, and an older answer is served while a refresh runs.
 */
export function nearbyMosques(lat: number, lng: number, radiusKm: number): Promise<Mosque[] | null> {
	const [rl, rg] = [Math.round(lat * 100) / 100, Math.round(lng * 100) / 100];
	return cached(`mosques:${rl}:${rg}:${radiusKm}`, 24 * 3600, () => query(`${(radiusKm + 1) * 1000},${rl},${rg}`));
}
