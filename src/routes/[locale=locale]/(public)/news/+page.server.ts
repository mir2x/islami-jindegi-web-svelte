import { error } from '@sveltejs/kit';
import { parsePageParam } from '#lib/list-paging.ts';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getNewsList } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const search = url.searchParams.get('q') ?? '';
	const page = parsePageParam(url.searchParams.get('page') ?? undefined);
	const result = await getNewsList({ search, page });
	if (result && page > 1 && result.data.length === 0) error(404, 'Not found');

	const t = getT(params.locale, 'NewsPage');
	return {
		items: result?.data ?? [],
		total: result?.total ?? 0,
		page,
		search,
		heading: t('metaTitle'),
		msgs: loadMessages(params.locale, 'NewsPage'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/news' })
	};
};
