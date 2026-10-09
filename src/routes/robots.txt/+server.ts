import { NEXT_PUBLIC_NOINDEX, NEXT_PUBLIC_SITE_URL } from '$app/env/public';
import { rawAsset } from '#lib/server/raw-asset.ts';

export const GET = () => {
	// Test/staging builds set NEXT_PUBLIC_NOINDEX=1 so they never compete with production in search.
	const body =
		NEXT_PUBLIC_NOINDEX === '1'
			? 'User-agent: *\nDisallow: /\n'
			: `User-agent: *\nAllow: /\nDisallow: /*/admin/\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${NEXT_PUBLIC_SITE_URL}/sitemap.xml\n`;
	return rawAsset(body, 'text/plain; charset=utf-8', 'public, max-age=3600');
};
