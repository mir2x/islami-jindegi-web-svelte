import { apiUrl } from '#lib/server/api.ts';
import { clearCache } from '#lib/server/cache.ts';
import type { RequestHandler } from './$types';

/**
 * Called by the admin after every write: drops the public site's cached API data so a change (a deleted
 * subchapter, say) shows up immediately. Only a signed-in admin may call it: the token is checked
 * against an authorized API endpoint.
 */
export const POST: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('authorization');
	if (!auth) return new Response(null, { status: 401 });
	const check = await fetch(apiUrl('/api/admins'), { headers: { authorization: auth }, signal: AbortSignal.timeout(8000) }).catch(() => null);
	if (!check?.ok) return new Response(null, { status: 401 });
	clearCache();
	return new Response(null, { status: 204 });
};
