export type SortDir = 'asc' | 'desc';
export interface Sort {
	key: string;
	dir: SortDir;
}

/** `position_desc` → `{ key: 'position', dir: 'desc' }`. */
export function parseSort(param: string): Sort {
	const i = param.lastIndexOf('_');
	return { key: param.slice(0, i), dir: param.slice(i + 1) === 'asc' ? 'asc' : 'desc' };
}

export const sortParam = (s: Sort) => `${s.key}_${s.dir}`;

/** First click on a new column sorts ascending; clicking the active column flips it. */
export const toggleSort = (s: Sort, key: string): Sort => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' });
