import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getArticles, getBayans, getBooks, getMalfuzats, getRecentNews } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

const HOME_PAGE_SIZE = 8;
const pick = <T>(r: { data: T[]; total: number } | null) => ({ data: r?.data ?? [], total: r?.total ?? 0 });

export const load: PageServerLoad = async ({ params }) => {
	const t = getT(params.locale, 'Metadata');
	const [books, bayans, malfuzat, articles, news] = await Promise.all([
		getBooks({ pageSize: HOME_PAGE_SIZE }),
		getBayans({ pageSize: HOME_PAGE_SIZE }),
		getMalfuzats({ pageSize: HOME_PAGE_SIZE }),
		getArticles({ pageSize: HOME_PAGE_SIZE }),
		getRecentNews(8)
	]);
	return {
		books: pick(books),
		bayans: pick(bayans),
		malfuzat: pick(malfuzat),
		articles: pick(articles),
		news,
		msgs: loadMessages(params.locale, 'Home'),
		// The home title already carries the brand, so it skips the "| brand" suffix.
		seo: buildSeo({ locale: params.locale, title: t('homeTitle'), description: t('homeDescription'), path: '/', absoluteTitle: true })
	};
};
