import { COMPRESS, SLOW_PAGE_MS } from '$app/env/private';
import { PUBLIC_NOINDEX } from '$app/env/public';
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { compress } from '#lib/server/compress.ts';
import { clip, log } from '#lib/server/log.ts';
import { httpDuration, httpRequests, serverErrors } from '#lib/server/metrics.ts';
import { resolveRedirect } from '#lib/server/redirects.ts';
import { currentRequestId, newContext, withContext } from '#lib/server/request-context.ts';

const NOINDEX = PUBLIC_NOINDEX === '1';
/** Kept out of the request metrics: the scrape itself and the browsers' report endpoint. */
const UNMEASURED = new Set(['/api/metrics', '/api/log']);

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
	const ctx = newContext(event.request.headers);
	const start = performance.now();
	const response = await withContext(ctx, () =>
		resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', lang)
		})
	);
	const ms = performance.now() - start;

	if (!UNMEASURED.has(pathname)) {
		// The route pattern, never the raw path, so the label set stays bounded.
		const route = event.route.id ?? 'unmatched';
		httpRequests.inc([route, `${Math.floor(response.status / 100)}xx`]);
		httpDuration.observe(ms / 1000, [route]);
		if (SLOW_PAGE_MS > 0 && ms >= SLOW_PAGE_MS) {
			// Where the time went: how much of it was spent waiting for the API.
			log('warn', 'web.slow', 'slow response', {
				request_id: ctx.requestId,
				route,
				uri: clip(pathname + search, 400),
				status: response.status,
				duration: Math.round(ms) / 1000,
				api_calls: ctx.api.calls,
				api_duration: Math.round(ctx.api.ms) / 1000,
				api_failed: ctx.api.failed
			});
		}
	}

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
	// Only where no cache will replay it: an id on a CDN-held page would name someone else's request.
	if (response.status >= 400) response.headers.set('x-request-id', ctx.requestId);
	return COMPRESS ? compress(event.request, response) : response;
};

/**
 * Every error nobody caught while rendering a page or running an endpoint. Logged once with the request
 * id; the visitor gets that id on the error page (`+error.svelte`) and nothing about the error itself.
 * A 404 for an unknown URL arrives here too and is not an error.
 */
export const handleError: HandleServerError = (input) => {
	const { event } = input;
	const requestId = currentRequestId();
	if (input.kind !== 'unknown') return { requestId };
	serverErrors.inc();
	const error = input.error;
	log('error', 'web.error', 'unhandled server error', {
		route: event.route.id ?? 'unmatched',
		uri: clip(event.url.pathname + event.url.search, 400),
		method: event.request.method,
		error: clip(error instanceof Error ? `${error.name}: ${error.message}` : String(error), 500),
		stack: error instanceof Error ? clip(error.stack, 4000) : undefined
	});
	return { message: 'Internal Error', requestId };
};
