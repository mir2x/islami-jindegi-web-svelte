import { toEntries, TOPIC_PAGE_SIZE, type TopicEntry } from '#lib/topics.ts';
import type { TopicModuleKey } from '#lib/types.ts';
import { getArticles, getBayans, getBooks, getDuas, getMalfuzats, getMasails } from './public-api.ts';

/** One page of a topic's items in one module: the module's own list endpoint, filtered by category. */
export async function getTopicModulePage(key: TopicModuleKey, categoryId: string, page: number): Promise<{ entries: TopicEntry[]; total: number } | null> {
	const opts = { categoryId, page, pageSize: TOPIC_PAGE_SIZE };
	switch (key) {
		case 'book': {
			const r = await getBooks(opts);
			return r && { entries: toEntries('book', r.data), total: r.total };
		}
		case 'bayan': {
			const r = await getBayans(opts);
			return r && { entries: toEntries('bayan', r.data), total: r.total };
		}
		case 'malfuzat': {
			const r = await getMalfuzats(opts);
			return r && { entries: toEntries('malfuzat', r.data), total: r.total };
		}
		case 'masail': {
			const r = await getMasails(opts);
			return r && { entries: toEntries('masail', r.data), total: r.total };
		}
		case 'article': {
			const r = await getArticles(opts);
			return r && { entries: toEntries('article', r.data), total: r.total };
		}
		case 'dua': {
			const r = await getDuas(opts);
			return r && { entries: toEntries('dua', r.data), total: r.total };
		}
	}
}
