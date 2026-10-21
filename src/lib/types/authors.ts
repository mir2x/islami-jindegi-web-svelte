import type { TopicModuleItems, TopicModuleKey } from './topics.ts';

/** Dua has no author, so author pages cover five modules, not the six topics has. */
export type AuthorBrowseModuleKey = Exclude<TopicModuleKey, 'dua'>;

/** An author shown on the authors index. `counts` holds published items per module, non-zero keys only.
 *  `slug` is null for authors without settings; link by `id` then. */
export interface AuthorBrowseSummary {
	id: string;
	slug: string | null;
	name: string;
	description?: string | null;
	total: number;
	counts: Partial<Record<AuthorBrowseModuleKey, number>>;
}

export interface AuthorBrowseGroup {
	id: string;
	title: string;
	authors: AuthorBrowseSummary[];
}

export interface AuthorBrowseIndex {
	groups: AuthorBrowseGroup[];
	ungrouped: AuthorBrowseSummary[];
}

export interface AuthorBrowseDetail extends AuthorBrowseSummary {
	/** The author's own bio (Authors.Info); `description` is the curated blurb for this page. */
	info?: string | null;
	/** First items of each module with content, in that module's default list order. */
	previews: Partial<{ [K in AuthorBrowseModuleKey]: TopicModuleItems[K][] }>;
}

/** An author as the authors-page admin sees it; setting fields are null when it has no settings row yet. */
export interface AuthorBrowseAdminItem {
	authorId: string;
	name: string;
	slug: string | null;
	groupId: string | null;
	position: number | null;
	hidden: boolean;
	description: string | null;
	total: number;
	counts: Partial<Record<string, number>>;
}

export interface AuthorBrowseGroupAdmin {
	id: string;
	title: string;
	position: number;
}

export interface AuthorBrowseAdminResponse {
	groups: AuthorBrowseGroupAdmin[];
	authors: AuthorBrowseAdminItem[];
}
