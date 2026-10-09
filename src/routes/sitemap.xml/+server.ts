import { NEXT_PUBLIC_NOINDEX } from '$app/env/public';
import { cached } from '#lib/server/cache.ts';
import { listSitemapFiles } from '#lib/server/sitemap/entries.ts';
import { renderIndex, XML_HEADERS } from '#lib/server/sitemap/render.ts';

// Sitemap index: one entry per file under /sitemaps. Rebuilt hourly; if the API is down the last
// good copy keeps being served instead of a truncated one.
export const GET = async () => {
	// Staging/test builds must not advertise any URLs (robots.txt already disallows everything).
	const files = NEXT_PUBLIC_NOINDEX === '1' ? [] : await cached('sitemap:index', 3600, listSitemapFiles);
	if (!files) return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'retry-after': '300' } });
	return new Response(renderIndex(files), { headers: { ...XML_HEADERS, 'cache-control': 'public, max-age=3600' } });
};
