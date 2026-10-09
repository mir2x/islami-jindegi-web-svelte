import type { BrowserConfig } from '#lib/components/browser/types.ts';
import { MODULE_DEFAULT_SORT } from '#lib/modules.ts';

export const BOOKS: BrowserConfig = {
	basePath: '/books',
	api: '/api/books',
	sort: MODULE_DEFAULT_SORT.book,
	pageSize: 24,
	ns: 'BooksPage',
	filters: ['search', 'categoryId', 'authorId', 'dateFrom', 'dateTo'],
	authorKey: 'author',
	dated: true,
	// The books list is a cover grid: every card links to the reader, there is no side panel.
	detail: 'item'
};
