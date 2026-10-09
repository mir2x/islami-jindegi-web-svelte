import type { MediaItem } from '#lib/types.ts';
import { PagedLoader } from '../list/loader.svelte.ts';
import type { FilterType } from './files.ts';

/** Search / type / page state of a media grid, plus its loader. Call `reload()` from an `$effect` to follow the state. */
export class MediaBrowser {
	search = $state('');
	type = $state<FilterType>('all');
	page = $state(1);
	loader = new PagedLoader<MediaItem>('/api/media');

	constructor(
		readonly pageSize: number,
		type: FilterType = 'all'
	) {
		this.type = type;
	}

	reload = () => this.loader.load({ page: this.page, pageSize: this.pageSize, search: this.search || undefined, type: this.type === 'all' ? undefined : this.type });

	setSearch(value: string) {
		this.search = value;
		this.page = 1;
	}

	setType(value: FilterType) {
		this.type = value;
		this.page = 1;
	}
}
