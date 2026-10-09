import type { BrowserConfig } from '#lib/components/browser/types.ts';
import { MODULE_DEFAULT_SORT } from '#lib/modules.ts';

export const MALFUZAT: BrowserConfig = {
	basePath: '/malfuzat',
	api: '/api/malfuzat',
	sort: MODULE_DEFAULT_SORT.malfuzat,
	pageSize: 20,
	ns: 'MalfuzatPage',
	filters: ['search', 'categoryId', 'authorId', 'dateFrom', 'dateTo', 'hasAudio'],
	authorKey: 'speaker',
	dated: true,
	tabs: true,
	detail: 'fetch'
};
