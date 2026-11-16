import { apiUrl } from '#lib/server/api.ts';
import { insights, isRange } from '#lib/server/insights/index.ts';
import { log } from '#lib/server/log.ts';
import { configured } from '#lib/server/insights/openobserve.ts';
import type { RequestHandler } from './$types';

/**
 * Data for the admin Insights page. Only a signed-in admin may call it (the token is checked against an
 * authorized API endpoint, as `/api/revalidate` does), and the browser never learns where the numbers come from.
 */
export const GET: RequestHandler = async ({ request, url }) => {
	const auth = request.headers.get('authorization');
	if (!auth) return new Response(null, { status: 401 });
	const check = await fetch(apiUrl('/api/admins'), { headers: { authorization: auth }, signal: AbortSignal.timeout(8000) }).catch(() => null);
	if (!check?.ok) return new Response(null, { status: 401 });

	if (!configured()) return Response.json({ error: 'not-configured' }, { status: 503, headers: { 'cache-control': 'no-store' } });
	const range = url.searchParams.get('range') ?? '7d';
	if (!isRange(range)) return new Response(null, { status: 400 });
	try {
		return Response.json(await insights(range), { headers: { 'cache-control': 'no-store' } });
	} catch (e) {
		log('error', 'web.insights', 'insights query failed', { error: String(e).slice(0, 300) });
		return Response.json({ error: 'unavailable' }, { status: 502, headers: { 'cache-control': 'no-store' } });
	}
};
