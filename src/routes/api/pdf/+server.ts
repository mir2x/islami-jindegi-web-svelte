import type { RequestHandler } from './$types';

const ALLOWED_HOSTS = ['static.islamijindegi.com'];

const isAllowed = (url: string) => {
	try {
		const { hostname } = new URL(url);
		return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
	} catch {
		return false;
	}
};

/** Same-origin proxy for book PDFs (the viewer needs CORS-free access to the bytes). */
export const GET: RequestHandler = async ({ url }) => {
	const target = url.searchParams.get('url');
	if (!target || !isAllowed(target)) return new Response('Forbidden', { status: 403 });

	const upstream = await fetch(target);
	if (!upstream.ok) return new Response('Not found', { status: upstream.status });

	return new Response(upstream.body, {
		headers: {
			'content-type': 'application/pdf',
			'cache-control': 'public, max-age=86400, stale-while-revalidate=3600'
		}
	});
};
