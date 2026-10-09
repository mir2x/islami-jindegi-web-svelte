import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getRecentArticles, getRecentBayans, getRecentBooks, getRecentMalfuzat, getRecentNews } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const t = getT(params.locale, 'ExplorePage');
	const [books, bayans, malfuzat, articles, news] = await Promise.all([getRecentBooks(10), getRecentBayans(10), getRecentMalfuzat(8), getRecentArticles(6), getRecentNews(6)]);
	return {
		books,
		bayans,
		malfuzat,
		articles,
		news,
		msgs: loadMessages(params.locale, 'ExplorePage'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/explore' })
	};
};
