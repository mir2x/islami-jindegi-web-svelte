import { TOPIC_MODULES, toEntries, type TopicEntry, type TopicModule } from './topics.ts';
import type { AuthorBrowseDetail, AuthorBrowseModuleKey, TopicModuleItems } from './types.ts';

/** How each content module appears on the author pages, in tab order. Dua has no author. */
export type AuthorModule = TopicModule & { key: AuthorBrowseModuleKey };

export const AUTHOR_BROWSE_MODULES = TOPIC_MODULES.filter((m): m is AuthorModule => m.key !== 'dua');

export function isAuthorModuleKey(value: string | undefined): value is AuthorBrowseModuleKey {
	return AUTHOR_BROWSE_MODULES.some((m) => m.key === value);
}

/** The modules an author has content in, in tab order. */
export function authorModules(counts: AuthorBrowseDetail['counts']): AuthorModule[] {
	return AUTHOR_BROWSE_MODULES.filter((m) => (counts[m.key] ?? 0) > 0);
}

/** URL of an author page; slug when there is one, author id otherwise. */
export function authorHref(author: { id: string; slug: string | null }) {
	return `/authors/${encodeURIComponent(author.slug ?? author.id)}`;
}

// Every row on an author page is by that author, so the per-item author line is dropped.
export const withoutAuthor = (entries: TopicEntry[]): TopicEntry[] => entries.map((e) => ({ ...e, subtitle: null }));

export function authorPreviewEntries<K extends AuthorBrowseModuleKey>(author: AuthorBrowseDetail, key: K): TopicEntry[] {
	const items = author.previews[key] as TopicModuleItems[K][] | undefined;
	return items ? withoutAuthor(toEntries(key, items)) : [];
}
