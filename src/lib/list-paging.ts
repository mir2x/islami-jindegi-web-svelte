/**
 * Paged list URLs (`/bayan?page=3`). The lists scroll infinitely, but every page of the catalogue
 * is also a real URL: the server renders that page's items and a link pager, so crawlers can walk
 * the whole catalogue and visitors can share a position in it.
 */

/** `?page=` as a positive integer; anything else is page 1. */
export function parsePageParam(raw: string | string[] | undefined): number {
	const n = Number(Array.isArray(raw) ? raw[0] : raw);
	return Number.isInteger(n) && n >= 1 ? n : 1;
}

/** Query params that turn a list into a filtered view (these never get their own indexable URL). */
const FILTER_PARAMS = ['q', 'category', 'author', 'tab', 'dateFrom', 'dateTo'] as const;

export function hasListFilters(sp: Record<string, string | string[] | undefined>): boolean {
	return FILTER_PARAMS.some((k) => {
		const v = sp[k];
		return Array.isArray(v) ? v.length > 0 : !!v && !(k === 'tab' && v === 'all');
	});
}

/**
 * Canonical path + title suffix flag for a list URL. Unfiltered pages 2..N are canonical to
 * themselves; page 1 and every filtered view are canonical to the bare list.
 */
export function listCanonical(basePath: string, page: number, filtered: boolean): { path: string; paged: boolean } {
	const paged = !filtered && page > 1;
	return { path: paged ? `${basePath}?page=${page}` : basePath, paged };
}
