import { postJson } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

/**
 * Where the "ask a question" form posts. It forwards to the API from here so the API sees the visitor's own
 * address (its per-address throttle) and the browser needs no cross-origin call. Anything but a clean
 * success is reduced to a short code the form can word for the visitor.
 */
const MAX_BODY = 10 * 1024;

export const POST: RequestHandler = async ({ request }) => {
	const text = await request.text().catch(() => '');
	if (!text || text.length > MAX_BODY) return Response.json({ error: 'invalid' }, { status: 400 });
	let b: Record<string, unknown>;
	try {
		b = JSON.parse(text);
	} catch {
		return Response.json({ error: 'invalid' }, { status: 400 });
	}
	const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
	const res = await postJson('/api/questions', {
		email: str(b.email, 300),
		question: str(b.question, 5000),
		locale: b.locale === 'en' ? 'en' : 'bn',
		website: str(b.website, 200)
	});
	if (res && res.status < 300) return Response.json({ ok: true }, { status: 201 });
	if (res?.status === 429) return Response.json({ error: 'rate' }, { status: 429 });
	if (res?.status === 400) return Response.json({ error: 'invalid' }, { status: 400 });
	return Response.json({ error: 'unavailable' }, { status: 502 });
};
