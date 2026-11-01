import { untrack } from 'svelte';
import type { PagedResult } from '#lib/types.ts';
import { api, qs } from '../api.ts';
import { toast } from '../toast.svelte.ts';

type Params = Record<string, string | number | boolean | undefined | null>;

/**
 * Loads one paged API list as an infinite list: `result.data` holds every row loaded so far. A newer
 * `load` cancels the previous request, so fast typing or scrolling can never let a slow, stale
 * response overwrite a fresh one.
 *
 * How a `load` is read, by comparing it with the last one that finished:
 * - same query, the next page: its rows are appended;
 * - same query, a page already loaded (a refresh after an edit or delete): pages 1..n are fetched
 *   again as one request, so the list keeps its length;
 * - any other query, or a first load: the rows are replaced.
 */
export class PagedLoader<T> {
	result = $state<PagedResult<T> | null>(null);
	loading = $state(true);
	#seq = 0;
	#abort?: AbortController;
	#query = '';
	#pages = 0;
	#size = 1;

	constructor(private path: string) {}

	async load(params: Params): Promise<void> {
		const seq = ++this.#seq;
		this.#abort?.abort();
		const abort = (this.#abort = new AbortController());
		this.loading = true;

		const { page: asked, ...rest } = params;
		const size = Number(params.pageSize) || 20;
		const query = JSON.stringify(rest);
		// Untracked: callers run `load` inside an `$effect`, and reading `result` there would re-run
		// the effect every time a load finishes, forever.
		const current = untrack(() => this.result);
		const same = !!current && query === this.#query;
		const append = same && Number(asked ?? 1) > this.#pages;
		const refresh = same && !append && this.#pages > 1;
		const request = append ? { ...rest, page: this.#pages + 1 } : refresh ? { ...rest, page: 1, pageSize: size * this.#pages } : { ...rest, page: 1 };

		try {
			const res = await api.get<PagedResult<T>>(`${this.path}?${qs(request)}`, abort.signal);
			if (seq !== this.#seq) return;
			this.#size = size;
			this.#query = query;
			this.#pages = append ? this.#pages + 1 : refresh ? this.#pages : 1;
			this.result = append && current ? { ...res, data: [...current.data, ...res.data] } : res;
		} catch (e) {
			if (seq === this.#seq && !(e instanceof DOMException && e.name === 'AbortError')) toast.error(e instanceof Error ? e.message : 'Failed to load');
		} finally {
			if (seq === this.#seq) this.loading = false;
		}
	}

	get totalPages(): number {
		return this.result ? Math.max(1, Math.ceil(this.result.total / this.#size)) : 1;
	}
}
