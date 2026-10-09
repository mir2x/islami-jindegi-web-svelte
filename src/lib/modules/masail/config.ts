import type { BrowserConfig } from '#lib/components/browser/types.ts';
import { MODULE_DEFAULT_SORT } from '#lib/modules.ts';

export const MASAIL: BrowserConfig = {
	basePath: '/masail',
	api: '/api/masail',
	sort: MODULE_DEFAULT_SORT.masail,
	pageSize: 20,
	ns: 'MasailPage',
	filters: ['search', 'categoryId', 'authorId', 'dateFrom', 'dateTo', 'hasAudio'],
	authorKey: 'speaker',
	dated: true,
	tabs: true,
	detail: 'fetch'
};
