export interface ListOpts {
	page?: number;
	pageSize?: number;
	search?: string;
	categoryId?: string;
	authorId?: string;
	dateFrom?: string;
	dateTo?: string;
	hasAudio?: boolean;
}

export type ListFilter = Exclude<keyof ListOpts, 'page' | 'pageSize'>;

export const DATED_FILTERS: ListFilter[] = ['search', 'categoryId', 'authorId', 'dateFrom', 'dateTo'];

/**
 * Query string for a published, paged module list. Only the filters the module's endpoint
 * understands are sent. Shared by the server loaders and the browser's infinite scroll so the two
 * fetch paths cannot drift.
 */
export function listQuery(sort: string, defaultPageSize: number, filters: ListFilter[], opts: ListOpts): URLSearchParams {
	const q = new URLSearchParams({
		published: 'true',
		sort,
		page: String(opts.page ?? 1),
		pageSize: String(opts.pageSize ?? defaultPageSize)
	});
	for (const key of filters) {
		const value = opts[key];
		if (value !== undefined && value !== '') q.set(key, String(value));
	}
	// Filtering by date only makes sense newest-first.
	if (filters.includes('dateFrom') && (opts.dateFrom || opts.dateTo)) q.set('sort', 'date_desc');
	return q;
}
