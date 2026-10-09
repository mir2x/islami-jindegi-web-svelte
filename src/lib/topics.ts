import type { TopicDetail, TopicModuleItems, TopicModuleKey } from './types.ts';

/** How each content module appears on the বিষয়ভিত্তিক pages, in tab order. */
export interface TopicModule {
	key: TopicModuleKey;
	/** Label key in the `Nav` messages namespace. */
	navKey: 'books' | 'bayan' | 'malfuzat' | 'masail' | 'articles' | 'dua';
	/** The module's own section, which takes `?category=` as a filter. */
	path: string;
}

export const TOPIC_MODULES: TopicModule[] = [
	{ key: 'book', navKey: 'books', path: '/books' },
	{ key: 'bayan', navKey: 'bayan', path: '/bayan' },
	{ key: 'malfuzat', navKey: 'malfuzat', path: '/malfuzat' },
	{ key: 'masail', navKey: 'masail', path: '/masail' },
	{ key: 'article', navKey: 'articles', path: '/articles' },
	{ key: 'dua', navKey: 'dua', path: '/dua' }
];

export const TOPIC_PAGE_SIZE = 20;

export function isTopicModuleKey(value: string | undefined): value is TopicModuleKey {
	return TOPIC_MODULES.some((m) => m.key === value);
}

/** The modules a topic has content in, in tab order. */
export function topicModules(counts: TopicDetail['counts']): TopicModule[] {
	return TOPIC_MODULES.filter((m) => (counts[m.key] ?? 0) > 0);
}

/** URL of a topic page; slug when there is one, category id otherwise. */
export function topicHref(topic: { id: string; slug: string | null }) {
	return `/topics/${encodeURIComponent(topic.slug ?? topic.id)}`;
}

/** One item from any module, reduced to what the topic lists render. */
export interface TopicEntry {
	id: string;
	title: string;
	subtitle: string | null;
	href: string;
	/** Books only; the other modules render as text. */
	coverUrl?: string | null;
}

const ENTRY: { [K in TopicModuleKey]: (item: TopicModuleItems[K]) => TopicEntry } = {
	book: (b) => ({
		id: b.id,
		title: b.title,
		href: `/books/${b.id}`,
		// `?? null`: the API omits null fields, and undefined here would mean "not a book" (no cover slot).
		coverUrl: b.coverUrl ?? null,
		subtitle: b.authors.map((a) => a.name).join(', ') || null
	}),
	bayan: (b) => ({ id: b.id, title: b.title, href: `/bayan/${b.id}`, subtitle: b.author?.name ?? null }),
	malfuzat: (m) => ({ id: m.id, title: m.title, href: `/malfuzat/${m.id}`, subtitle: m.author?.name ?? null }),
	masail: (m) => ({ id: m.id, title: m.title, href: `/masail/${m.id}`, subtitle: m.author?.name ?? null }),
	article: (a) => ({ id: a.id, title: a.title, href: `/articles/${a.id}`, subtitle: a.author?.name ?? null }),
	dua: (d) => ({ id: d.id, title: d.title, href: `/dua/${d.id}`, subtitle: null })
};

export function toEntries<K extends TopicModuleKey>(key: K, items: TopicModuleItems[K][]): TopicEntry[] {
	const map: (item: TopicModuleItems[K]) => TopicEntry = ENTRY[key];
	return items.map(map);
}

export function previewEntries<K extends TopicModuleKey>(topic: TopicDetail, key: K): TopicEntry[] {
	const items = topic.previews[key] as TopicModuleItems[K][] | undefined;
	return items ? toEntries(key, items) : [];
}
