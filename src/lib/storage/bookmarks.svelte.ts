import { StoredValue } from './stored.svelte.ts';

export interface QuranBookmark {
	surahNumber: number;
	ayahNumber: number;
	surahName: string;
	arabic: string;
	addedAt: string;
}

export interface HadithBookmark {
	bookSlug: string;
	bookTitle: string;
	chapterId: number;
	hadithNumber: number;
	excerpt: string;
	addedAt: string;
}

export interface MushafPageBookmark {
	editionId: string;
	page: number;
	sura: number;
	para: number | null;
	addedAt: string;
}

/** A list of bookmarks with add-or-remove toggling, identified by `same`. */
class BookmarkList<T extends { addedAt: string }> {
	store: StoredValue<T[]>;
	#same: (a: T, b: Omit<T, 'addedAt'>) => boolean;

	constructor(key: string, same: (a: T, b: Omit<T, 'addedAt'>) => boolean) {
		this.store = new StoredValue<T[]>(key, []);
		this.#same = same;
	}

	get all(): T[] {
		return this.store.current;
	}
	has = (probe: Partial<Omit<T, 'addedAt'>>) => this.store.current.some((b) => this.#same(b, probe as Omit<T, 'addedAt'>));

	/** Adds the bookmark if absent, removes it if present. Returns the resulting bookmarked state. */
	toggle = (bookmark: Omit<T, 'addedAt'>): boolean => {
		const list = this.store.read();
		if (list.some((b) => this.#same(b, bookmark))) {
			this.store.set(list.filter((b) => !this.#same(b, bookmark)));
			return false;
		}
		this.store.set([...list, { ...bookmark, addedAt: new Date().toISOString() } as T]);
		return true;
	};
	remove = (probe: Omit<T, 'addedAt'>) => this.store.set(this.store.read().filter((b) => !this.#same(b, probe)));
}

export const quranBookmarks = new BookmarkList<QuranBookmark>('quran_bookmarks', (a, b) => a.surahNumber === b.surahNumber && a.ayahNumber === b.ayahNumber);
export const hadithBookmarks = new BookmarkList<HadithBookmark>('hadith_bookmarks', (a, b) => a.bookSlug === b.bookSlug && a.hadithNumber === b.hadithNumber);
export const mushafBookmarks = new BookmarkList<MushafPageBookmark>('mushaf_page_bookmarks', (a, b) => a.editionId === b.editionId && a.page === b.page);
