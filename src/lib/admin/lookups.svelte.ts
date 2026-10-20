import type { Author, Book, Category, PagedResult } from '#lib/types.ts';
import { api } from './api.ts';

/** Authors and the category tree back the pickers and filters on most screens. Every call refetches: nothing is cached. */
class Lookups {
	authors = $state<Author[]>([]);
	categories = $state<Category[]>([]);
	books = $state<Book[]>([]);

	// Unpaged: the paged endpoint is clamped to 100 rows, which silently dropped most of the ~400 authors.
	ensureAuthors(): Promise<void> {
		return api.get<Author[]>('/api/authors/all').then((all) => void (this.authors = all));
	}

	ensureCategories(): Promise<void> {
		return api.get<Category[]>('/api/categories').then((all) => void (this.categories = all));
	}

	/** Every book, for the book pickers. The API clamps page size to 100, so this walks the pages. */
	async ensureBooks(): Promise<void> {
		const all: Book[] = [];
		for (let page = 1; ; page++) {
			const res = await api.get<PagedResult<Book>>(`/api/books?page=${page}&pageSize=100&sort=title_asc`);
			all.push(...res.data);
			if (all.length >= res.total || res.data.length === 0) break;
		}
		this.books = all;
	}

	ensureAll(): Promise<unknown> {
		return Promise.allSettled([this.ensureAuthors(), this.ensureCategories()]);
	}
}

export const lookups = new Lookups();
