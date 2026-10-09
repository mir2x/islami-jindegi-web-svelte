import type { PagedResult } from '#lib/types.ts';
import { api, qs } from '../api.ts';
import { toast } from '../toast.svelte.ts';

type Params = Record<string, string | number | boolean | undefined | null>;

/**
 * Loads one paged API list. A newer `load` cancels the previous request, so fast typing or paging
 * can never let a slow, stale response overwrite a fresh one.
 */
export class PagedLoader<T> {
	result = $state<PagedResult<T> | null>(null);
	loading = $state(true);
	#seq = 0;
	#abort?: AbortController;

	constructor(private path: string) {}

	async load(params: Params): Promise<void> {
		const seq = ++this.#seq;
		this.#abort?.abort();
		const abort = (this.#abort = new AbortController());
		this.loading = true;
		try {
			const res = await api.get<PagedResult<T>>(`${this.path}?${qs(params)}`, abort.signal);
			if (seq === this.#seq) this.result = res;
		} catch (e) {
			if (seq === this.#seq && !(e instanceof DOMException && e.name === 'AbortError')) toast.error(e instanceof Error ? e.message : 'Failed to load');
		} finally {
			if (seq === this.#seq) this.loading = false;
		}
	}

	get totalPages(): number {
		return this.result ? Math.max(1, Math.ceil(this.result.total / this.result.pageSize)) : 1;
	}
}
