import type { Book } from './books.ts';
import type { ArticleListItem, BayanListItem, DuaListItem, MalfuzatListItem, MasailListItem } from './content.ts';

export type TopicModuleKey = 'book' | 'bayan' | 'malfuzat' | 'masail' | 'article' | 'dua';

/** The list-item shape of each module, as its list endpoint returns it. */

export interface TopicModuleItems {
	book: Book;
	bayan: BayanListItem;
	malfuzat: MalfuzatListItem;
	masail: MasailListItem;
	article: ArticleListItem;
	dua: DuaListItem;
}

/** A category shown as a topic. `counts` holds published items per module, non-zero keys only.
 *  `slug` is null for categories without topic settings; link by `id` then. */

export interface TopicSummary {
	id: string;
	slug: string | null;
	title: string;
	icon?: string | null;
	total: number;
	counts: Partial<Record<TopicModuleKey, number>>;
}

export interface TopicGroup {
	id: string;
	title: string;
	topics: TopicSummary[];
}

export interface TopicIndex {
	groups: TopicGroup[];
	ungrouped: TopicSummary[];
}

export interface TopicDetail extends TopicSummary {
	description: string | null;
	/** First items of each module with content, in that module's default list order. */
	previews: Partial<{ [K in TopicModuleKey]: TopicModuleItems[K][] }>;
}

/** A category as the topics admin sees it; setting fields are null when it has no settings row yet. */
