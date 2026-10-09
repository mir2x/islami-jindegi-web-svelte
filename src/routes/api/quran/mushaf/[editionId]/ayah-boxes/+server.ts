import { json } from '@sveltejs/kit';
import { cached } from '#lib/server/cache.ts';
import { getMushafs } from '#lib/server/quran-api.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const edition = (await getMushafs()).find((e) => e.id === params.editionId);
	if (!edition) return json({ error: 'Unknown edition' }, { status: 404 });

	const data = await cached(`ayah-boxes:${edition.id}`, 24 * 60 * 60, async () => {
		const res = await fetch(edition.ayahBoxesUrl, { signal: AbortSignal.timeout(15000) });
		return res.ok ? await res.json() : null;
	});
	if (!data) return json({ error: 'Failed to fetch boxes' }, { status: 502 });

	return json(data, { headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' } });
};
