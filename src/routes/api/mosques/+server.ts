import { nearbyMosques } from '#lib/server/mosques.ts';
import { currentVisitorIp } from '#lib/server/request-context.ts';
import type { RequestHandler } from './$types';

/** `GET /api/mosques?lat=&lng=&radius=` (radius in km: 1, 3, 5 or 10). */
const RADII = [1, 3, 5, 10];
const PER_MINUTE = 20;
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

export const GET: RequestHandler = async ({ url }) => {
	const lat = Number(url.searchParams.get('lat'));
	const lng = Number(url.searchParams.get('lng'));
	const radius = Number(url.searchParams.get('radius') ?? 5);
	if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || !RADII.includes(radius)) return new Response(null, { status: 400 });
	if (!allow(currentVisitorIp() ?? 'unknown')) return new Response(null, { status: 429 });
	const mosques = await nearbyMosques(lat, lng, radius);
	if (!mosques) return new Response(null, { status: 502 });
	return Response.json({ mosques }, { headers: { 'cache-control': 'public, max-age=300' } });
};
