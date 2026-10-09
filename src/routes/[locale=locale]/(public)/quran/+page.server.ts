import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getMushafs, getQuranSurahs } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const t = getT(params.locale, 'QuranLanding');
	const [editions, surahs] = await Promise.all([getMushafs(), getQuranSurahs()]);
	return {
		editions,
		surahs,
		heading: t('metaTitle'),
		msgs: loadMessages(params.locale, 'QuranLanding', 'QuranSearchModal', 'BookmarksModal'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/quran' })
	};
};
