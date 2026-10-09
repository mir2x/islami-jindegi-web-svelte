import { loadListPage } from '#lib/server/list-page.ts';
import { getArticleAuthors, getArticleCategories, getArticles } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) =>
	loadListPage({
		locale: params.locale,
		url,
		ns: 'ArticlesPage',
		basePath: '/articles',
		list: getArticles,
		authors: getArticleAuthors,
		categories: getArticleCategories
	});
