import { COMPRESS } from '$app/env/private';
import { NEXT_PUBLIC_NOINDEX } from '$app/env/public';
import type { Handle } from '@sveltejs/kit/hooks';
import { compress } from '#lib/server/compress.ts';
import { resolveRedirect } from '#lib/server/redirects.ts';

const NOINDEX = NEXT_PUBLIC_NOINDEX === '1';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname, search } = event.url;

	const redirect = event.request.method === 'GET' || event.request.method === 'HEAD' ? resolveRedirect(pathname, search) : null;
	if (redirect) {
		return new Response(null, {
			status: 308,
			headers: {
				location: redirect.location,
				// A missing locale always maps to /bn, but no browser or CDN may hold on to that.
				...(redirect.addedLocale ? { 'cache-control': 'no-store, must-revalidate' } : {})
			}
		});
	}

	const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'bn';
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});

	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	// The dashboard is client-rendered, so its HTML shell carries no meta tags: keep it out of search by header.
	const isAdmin = /^\/(bn|en)\/admin(\/|$)/.test(pathname);
	if (NOINDEX || isAdmin) response.headers.set('x-robots-tag', 'noindex, nofollow');
	// The admin shell must never be held by a browser or CDN.
	if (isAdmin) response.headers.set('cache-control', 'no-store, must-revalidate');

	// Public, cookie-free HTML: let a CDN hold it briefly. Everything else keeps its own headers.
	if (response.status === 200 && event.request.method === 'GET' && !response.headers.has('cache-control') && response.headers.get('content-type')?.startsWith('text/html')) {
		response.headers.set('cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=30');
	}
	return COMPRESS ? compress(event.request, response) : response;
};
