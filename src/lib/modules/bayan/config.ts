import type { BrowserConfig } from '#lib/components/browser/types.ts';
import { MODULE_DEFAULT_SORT } from '#lib/modules.ts';

export const BAYAN: BrowserConfig = {
	basePath: '/bayan',
	api: '/api/bayan',
	sort: MODULE_DEFAULT_SORT.bayan,
	pageSize: 20,
	ns: 'BayanPage',
	filters: ['search', 'categoryId', 'authorId', 'dateFrom', 'dateTo'],
	authorKey: 'speaker',
	dated: true,
	// A bayan's list row already carries everything the panel shows.
	detail: 'item'
};
