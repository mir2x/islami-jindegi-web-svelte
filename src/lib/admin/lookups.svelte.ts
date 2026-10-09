import type { Author, Book, Category, PagedResult } from '#lib/types.ts';
import { api } from './api.ts';

/**
 * Authors and the category tree back the pickers and filters on most screens. They load once and are
 * shared; the author / category screens call `invalidate()` after a change so the next screen refetches.
 */
class Lookups {
	authors = $state<Author[]>([]);
	categories = $state<Category[]>([]);
	books = $state<Book[]>([]);
	#books: Promise<void> | null = null;
	#authors: Promise<void> | null = null;
	#categories: Promise<void> | null = null;

	ensureAuthors(): Promise<void> {
		// Unpaged: the paged endpoint is clamped to 100 rows, which silently dropped most of the ~400 authors.
		return (this.#authors ??= api.get<Author[]>('/api/authors/all').then(
			(all) => void (this.authors = all),
			(e) => {
				this.#authors = null;
				throw e;
			}
		));
	}

	ensureCategories(): Promise<void> {
		return (this.#categories ??= api.get<Category[]>('/api/categories').then(
			(all) => void (this.categories = all),
			(e) => {
				this.#categories = null;
				throw e;
			}
		));
	}

	/** Every book, for the book pickers. The API clamps page size to 100, so this walks the pages. */
	ensureBooks(): Promise<void> {
		return (this.#books ??= (async () => {
			const all: Book[] = [];
			for (let page = 1; ; page++) {
				const res = await api.get<PagedResult<Book>>(`/api/books?page=${page}&pageSize=100&sort=title_asc`);
				all.push(...res.data);
				if (all.length >= res.total || res.data.length === 0) break;
			}
			this.books = all;
		})().catch((e) => {
			this.#books = null;
			throw e;
		}));
	}

	ensureAll(): Promise<unknown> {
		return Promise.allSettled([this.ensureAuthors(), this.ensureCategories()]);
	}

	invalidate(which: 'authors' | 'categories' | 'books' | 'both' = 'both') {
		if (which === 'books') this.#books = null;
		if (which === 'both' || which === 'authors') this.#authors = null;
		if (which === 'both' || which === 'categories') this.#categories = null;
	}
}

export const lookups = new Lookups();
