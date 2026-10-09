import { goto } from '$app/navigation';
import { untrack } from 'svelte';
import { apiGet } from '#lib/client-api.ts';
import type { DateRange } from '#lib/filters.ts';
import { listQuery } from '#lib/list-query.ts';
import { currentLocale, localePath } from '#lib/i18n/use-t.svelte.ts';
import type { PagedResult } from '#lib/types.ts';
import { tabToHasAudio, type BrowserConfig, type ListFilters, type Tab } from './types.ts';

export interface InitialList<T> {
	items: T[];
	total: number;
	/** `?page=N` the server rendered; infinite scroll continues from here. */
	page: number;
	filters: ListFilters;
}

export interface ListSnapshot<T> {
	items: T[];
	total: number;
	page: number;
	basePage: number;
	filters: ListFilters;
}

/**
 * Filters, paging and URL sync of a list/detail browser.
 *
 * - Every filter change updates the address bar in place (shallow, no navigation) and refetches
 *   page 1 from the API; a slower, older reply never overwrites a newer one.
 * - Scrolling appends the next pages. Each page of the catalogue is also a real server-rendered URL
 *   (`?page=N`), so `basePage` remembers the page the list started on.
 */
export class ListState<T extends { id: string }> {
	items = $state<T[]>([]);
	total = $state(0);
	page = $state(1);
	basePage = $state(1);
	loading = $state(false);
	loadingMore = $state(false);
	filters = $state<ListFilters>({ search: '', category: '', author: '', tab: 'all', dateFrom: '', dateTo: '' });
	selectedId = $state<string | null>(null);

	#cfg: BrowserConfig;
	#timer: ReturnType<typeof setTimeout> | undefined;
	#req = 0;
	#onReset?: () => void;

	constructor(cfg: BrowserConfig, initial: InitialList<T>, onReset?: () => void) {
		this.#cfg = cfg;
		this.#onReset = onReset;
		untrack(() => {
			this.items = initial.items;
			this.total = initial.total;
			this.page = initial.page;
			this.basePage = initial.page;
			this.filters = { ...initial.filters };
		});
	}

	/** What to remember when the visitor leaves (infinite-scroll state does not survive a navigation otherwise). */
	capture(): ListSnapshot<T> {
		return { items: this.items, total: this.total, page: this.page, basePage: this.basePage, filters: { ...this.filters } };
	}

	/** Re-applies a snapshot, but only if it was taken for the view the server just rendered. */
	restore(snapshot: ListSnapshot<T>) {
		if (JSON.stringify(snapshot.filters) !== JSON.stringify(this.filters) || snapshot.basePage !== this.basePage) return false;
		this.items = snapshot.items;
		this.total = snapshot.total;
		this.page = snapshot.page;
		return true;
	}

	get hasMore() {
		return this.page * this.#cfg.pageSize < this.total;
	}
	get hasFilters() {
		const f = this.filters;
		return !!(f.search || f.category || f.author || f.dateFrom || f.dateTo);
	}
	get totalPages() {
		return Math.ceil(this.total / this.#cfg.pageSize);
	}

	setSearch = (search: string) => this.#change({ search }, 350);
	setCategory = (id: string) => this.#change({ category: id === this.filters.category ? '' : id });
	setAuthor = (id: string) => this.#change({ author: id === this.filters.author ? '' : id });
	setTab = (tab: Tab) => this.#change({ tab });
	setDates = ({ from, to }: DateRange) => this.#change({ dateFrom: from, dateTo: to });
	clearAll = () => this.#change({ search: '', category: '', author: '', dateFrom: '', dateTo: '' });
	select = (id: string) => (this.selectedId = id);

	#change(patch: Partial<ListFilters>, debounce = 0) {
		this.filters = { ...this.filters, ...patch };
		this.#syncUrl();
		clearTimeout(this.#timer);
		const req = ++this.#req;
		this.#timer = setTimeout(async () => {
			this.loading = true;
			this.selectedId = null;
			const result = await this.#fetchPage(1);
			if (req !== this.#req) return;
			this.items = result.data;
			this.total = result.total;
			this.page = this.basePage = 1;
			this.loading = false;
			this.#onReset?.();
		}, debounce);
	}

	/** Appends the next page; called when the scroll sentinel comes into view. */
	async loadMore() {
		if (this.loadingMore || this.loading || !this.hasMore) return;
		this.loadingMore = true;
		const req = this.#req;
		const next = this.page + 1;
		const result = await this.#fetchPage(next);
		if (req !== this.#req) return;
		// De-dupe defensively: a filter reset racing an append could re-send page 1 rows.
		const seen = new Set(this.items.map((i) => i.id));
		this.items = [...this.items, ...result.data.filter((i) => !seen.has(i.id))];
		this.total = result.total;
		this.page = next;
		this.loadingMore = false;
	}

	async #fetchPage(page: number): Promise<{ data: T[]; total: number }> {
		const f = this.filters;
		const q = listQuery(this.#cfg.sort, this.#cfg.pageSize, this.#cfg.filters, {
			page,
			search: f.search,
			categoryId: f.category,
			authorId: f.author,
			dateFrom: f.dateFrom,
			dateTo: f.dateTo,
			hasAudio: tabToHasAudio(f.tab)
		});
		const result = await apiGet<PagedResult<T>>(`${this.#cfg.api}?${q}`);
		return result ?? { data: [], total: 0 };
	}

	#syncUrl() {
		const f = this.filters;
		const q = new URLSearchParams();
		if (f.search) q.set('q', f.search);
		if (f.category) q.set('category', f.category);
		if (f.author) q.set('author', f.author);
		if (f.tab !== 'all') q.set('tab', f.tab);
		if (f.dateFrom) q.set('dateFrom', f.dateFrom);
		if (f.dateTo) q.set('dateTo', f.dateTo);
		const qs = q.toString();
		const path = localePath(this.#cfg.basePath, currentLocale());
		void goto(qs ? `${path}?${qs}` : path, { replace: true, shallow: true, reset: false });
	}
}
