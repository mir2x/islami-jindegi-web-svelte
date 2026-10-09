import { untrack } from 'svelte';
import { apiGet } from '#lib/client-api.ts';
import type { PagedResult } from '#lib/types.ts';

const PAGE_SIZE = 8;

/** A list that starts with the server-rendered first page and fetches the rest as the panel is scrolled. */
export class PagedFeed<T> {
	items = $state<T[]>([]);
	total = $state(0);
	loading = $state(false);
	#page = 1;
	#path: string;
	#sort: string;

	constructor(path: string, sort: string, initial: T[], total: number) {
		this.#path = path;
		this.#sort = sort;
		untrack(() => {
			this.items = initial;
			this.total = total;
		});
	}

	get hasMore() {
		return this.items.length < this.total;
	}

	loadMore = async () => {
		if (this.loading || !this.hasMore) return;
		this.loading = true;
		const q = new URLSearchParams({ published: 'true', page: String(this.#page + 1), pageSize: String(PAGE_SIZE), sort: this.#sort });
		const res = await apiGet<PagedResult<T>>(`${this.#path}?${q}`);
		if (res) {
			this.items = [...this.items, ...res.data];
			this.total = res.total;
			this.#page += 1;
		}
		this.loading = false;
	};
}
