import { NEXT_PUBLIC_NOINDEX } from '$app/env/public';
import { cached } from '#lib/server/cache.ts';
import { getSitemapEntries } from '#lib/server/sitemap/entries.ts';
import { renderUrlset, XML_HEADERS } from '#lib/server/sitemap/render.ts';
import type { RequestHandler } from './$types';

// One sitemap file, e.g. /sitemaps/bayan-2.xml. Built on first request, then cached for an hour.
export const GET: RequestHandler = async ({ params }) => {
	// Only real file names reach the cache, so bots probing random names cannot evict useful entries.
	if (NEXT_PUBLIC_NOINDEX === '1' || !/^[a-z]+-[1-9]\d{0,3}\.xml$/.test(params.file)) return new Response('Not found', { status: 404 });

	const xml = await cached(`sitemap:${params.file}`, 3600, async () => {
		const entries = await getSitemapEntries(params.file);
		return entries ? renderUrlset(entries) : '';
	});
	if (xml === null) return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'retry-after': '300' } });
	if (xml === '') return new Response('Not found', { status: 404 });
	return new Response(xml, { headers: { ...XML_HEADERS, 'cache-control': 'public, max-age=3600' } });
};
