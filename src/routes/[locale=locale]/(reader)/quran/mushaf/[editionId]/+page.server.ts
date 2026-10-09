import { error } from '@sveltejs/kit';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getMushafs, getQuranReciters } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const [editions, reciters] = await Promise.all([getMushafs(), getQuranReciters()]);
	const edition = editions.find((e) => e.id === params.editionId);
	if (!edition) error(404, 'Not found');

	const t = getT(params.locale, 'MushafReader');
	return {
		edition,
		reciters,
		initialPage: Math.max(1, Math.min(edition.totalPages, Number(url.searchParams.get('page') ?? 1) || 1)),
		msgs: loadMessages(params.locale, 'MushafReader', 'SurahReader'),
		seo: buildSeo({
			locale: params.locale,
			title: t('metaTitle', { title: edition.title }),
			description: t('metaDescription', { title: edition.title }),
			path: `/quran/mushaf/${params.editionId}`,
			type: 'website'
		})
	};
};
