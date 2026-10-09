import type { BrowserConfig } from '#lib/components/browser/types.ts';
import { MODULE_DEFAULT_SORT } from '#lib/modules.ts';

export const DUA: BrowserConfig = {
	basePath: '/dua',
	api: '/api/dua',
	sort: MODULE_DEFAULT_SORT.dua,
	pageSize: 20,
	ns: 'DuaPage',
	// The dua endpoint has no authors and no date filter or date sort.
	filters: ['search', 'categoryId', 'hasAudio'],
	tabs: true,
	commonAllTab: true,
	detail: 'fetch'
};
