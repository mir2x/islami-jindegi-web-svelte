import type { MediaItem } from '#lib/types.ts';
import { PagedLoader } from '../list/loader.svelte.ts';
import type { FilterType } from './files.ts';

/** Search / type / page state of a media grid, plus its loader. Call `reload()` from an `$effect` to follow the state. */
export class MediaBrowser {
	search = $state('');
	type = $state<FilterType>('all');
	module = $state('');
	authorId = $state('');
	categoryId = $state('');
	dateFrom = $state('');
	dateTo = $state('');
	/**
	 * What the date range is matched against: the date of the content using the file (a 2013 bayan whose audio was
	 * uploaded in 2022 is found under 2013), or the file's upload date. Unused files have no content, so with
	 * `unused` the range is always the upload date.
	 */
	dateBy = $state<'content' | 'upload'>('content');
	/** Only files no content references. */
	unused = $state(false);
	page = $state(1);
	loader = new PagedLoader<MediaItem>('/api/media');

	constructor(
		readonly pageSize: number,
		type: FilterType = 'all'
	) {
		this.type = type;
	}

	/** Filters beyond search and type (module, author, category, dates, unused). */
	get filtered(): boolean {
		return !!(this.module || this.authorId || this.categoryId || this.dateFrom || this.dateTo || this.unused);
	}

	reload = () =>
		this.loader.load({
			page: this.page,
			pageSize: this.pageSize,
			search: this.search || undefined,
			type: this.type === 'all' ? undefined : this.type,
			module: this.module,
			authorId: this.authorId,
			categoryId: this.categoryId,
			dateFrom: this.dateFrom,
			dateTo: this.dateTo,
			dateBy: this.contentDates ? 'content' : undefined,
			unused: this.unused || undefined
		});

	/** The date range is applied to the content's date. */
	get contentDates(): boolean {
		return this.dateBy === 'content' && !this.unused && !!(this.dateFrom || this.dateTo);
	}

	setFilter(patch: Partial<Pick<MediaBrowser, 'module' | 'authorId' | 'categoryId' | 'dateFrom' | 'dateTo' | 'dateBy' | 'unused'>>) {
		Object.assign(this, patch);
		this.page = 1;
	}

	clearFilters() {
		this.setFilter({ module: '', authorId: '', categoryId: '', dateFrom: '', dateTo: '', unused: false });
	}

	setSearch(value: string) {
		this.search = value;
		this.page = 1;
	}

	setType(value: FilterType) {
		this.type = value;
		this.page = 1;
	}
}
