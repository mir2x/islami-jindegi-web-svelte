import { MODULE_DEFAULT_SORT } from '#lib/modules.ts';
import type { BrowserConfig } from '#lib/components/browser/types.ts';

export const ARTICLES: BrowserConfig = {
	basePath: '/articles',
	api: '/api/articles',
	sort: MODULE_DEFAULT_SORT.article,
	pageSize: 20,
	ns: 'ArticlesPage',
	filters: ['search', 'categoryId', 'authorId', 'dateFrom', 'dateTo'],
	authorKey: 'author',
	dated: true,
	detail: 'fetch'
};
