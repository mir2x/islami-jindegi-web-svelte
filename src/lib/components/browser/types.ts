import type { ListFilter } from '#lib/list-query.ts';

export type Tab = 'all' | 'text' | 'audio';

export interface ListFilters {
	search: string;
	category: string;
	author: string;
	tab: Tab;
	dateFrom: string;
	dateTo: string;
}

export const EMPTY_FILTERS: ListFilters = { search: '', category: '', author: '', tab: 'all', dateFrom: '', dateTo: '' };

/** Static settings of one list/detail module (articles, bayan, masail, ...). */
export interface BrowserConfig {
	/** Locale-less list path, e.g. `/bayan`. */
	basePath: string;
	/** API list endpoint, e.g. `/api/bayan`. */
	api: string;
	sort: string;
	pageSize: number;
	/** Message namespace of the module (`BayanPage`). */
	ns: string;
	/** Filters the endpoint understands (decides what the browser sends). */
	filters: ListFilter[];
	/** Message keys for the author filter's title / empty text (`speaker` or `author`). */
	authorKey?: 'speaker' | 'author';
	/** Show the date-range filter. */
	dated?: boolean;
	/** Show the all / text / audio tabs. */
	tabs?: boolean;
	/** Use `Common.all` instead of the module's `tabAll` for the first tab. */
	commonAllTab?: boolean;
	/** `fetch` loads the detail from `{api}/{id}` on selection; `item` reuses the list row. */
	detail: 'fetch' | 'item';
}

export const tabToHasAudio = (tab: Tab): boolean | undefined => (tab === 'audio' ? true : tab === 'text' ? false : undefined);

/** What the engine hands a module's row snippet. */
export interface RowContext {
	selected: boolean;
	href: string;
	onselect: () => void;
}
