import { cacheSize } from '#lib/server/cache.ts';
import { render } from '#lib/server/metrics.ts';
import type { RequestHandler } from './$types';

/**
 * Prometheus metrics for the monitoring agent on the host, which scrapes the loopback-published port
 * directly. nginx sets `X-Client-IP` on everything it forwards (and Cloudflare `CF-Connecting-IP`), so a
 * request carrying either came from the internet and gets a 404. Same rule as the API's `/metrics`.
 */
export const GET: RequestHandler = ({ request }) => {
	const h = request.headers;
	if (h.has('x-client-ip') || h.has('cf-connecting-ip') || h.has('x-forwarded-for')) return new Response(null, { status: 404 });
	const body = render({ ij_web_cache_entries: { help: 'API responses held in the data cache.', value: cacheSize() } });
	return new Response(body, { headers: { 'content-type': 'text/plain; version=0.0.4; charset=utf-8', 'cache-control': 'no-store' } });
};
