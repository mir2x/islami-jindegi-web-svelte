import { withoutAuthor } from '#lib/authors.ts';
import { toEntries, TOPIC_PAGE_SIZE, type TopicEntry } from '#lib/topics.ts';
import type { AuthorBrowseModuleKey } from '#lib/types.ts';
import { getArticles, getBayans, getBooks, getMalfuzats, getMasails } from './public-api.ts';

/** One page of an author's items in one module: the module's own list endpoint, filtered by author. */
export async function getAuthorModulePage(key: AuthorBrowseModuleKey, authorId: string, page: number): Promise<{ entries: TopicEntry[]; total: number } | null> {
	const opts = { authorId, page, pageSize: TOPIC_PAGE_SIZE };
	switch (key) {
		case 'book': {
			const r = await getBooks(opts);
			return r && { entries: withoutAuthor(toEntries('book', r.data)), total: r.total };
		}
		case 'bayan': {
			const r = await getBayans(opts);
			return r && { entries: withoutAuthor(toEntries('bayan', r.data)), total: r.total };
		}
		case 'malfuzat': {
			const r = await getMalfuzats(opts);
			return r && { entries: withoutAuthor(toEntries('malfuzat', r.data)), total: r.total };
		}
		case 'masail': {
			const r = await getMasails(opts);
			return r && { entries: withoutAuthor(toEntries('masail', r.data)), total: r.total };
		}
		case 'article': {
			const r = await getArticles(opts);
			return r && { entries: withoutAuthor(toEntries('article', r.data)), total: r.total };
		}
	}
}
