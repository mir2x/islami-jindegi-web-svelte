import sw from '#lib/assets/sw.txt?raw';

// Must never be cached: this is the worker that removes the old Ember service worker, so browsers
// have to see it on every update check.
export const GET = () =>
	new Response(sw, {
		headers: {
			'content-type': 'text/javascript; charset=utf-8',
			'cache-control': 'no-store, must-revalidate',
			'service-worker-allowed': '/'
		}
	});
