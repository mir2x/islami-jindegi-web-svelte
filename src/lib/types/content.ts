export interface AuthorModuleMembership {
	module: string;
	position: number;
}

export interface Author {
	id: string;
	name: string;
	info: string | null;
	/** Legacy global position, which is really the books ordering. Per-module now — see `modules`. */
	position: number;
	createdAt: string;
	updatedAt: string;
	/** Which module lists this author appears in, and where. Only the author endpoints send it. */
	modules?: AuthorModuleMembership[];
}

export interface CategoryModuleMembership {
	module: string;
	position: number;
}

export interface Category {
	id: string;
	title: string;
	/** Legacy global position. Ordering is per-module now — see `modules`. */
	position: number;
	parentId: string | null;
	children: Category[];
	createdAt: string;
	updatedAt: string;
	/** Which module lists this category appears in, and where. Only the category endpoints send it. */
	modules?: CategoryModuleMembership[];
}

export interface MalfuzatListItem {
	id: string;
	title: string;
	excerpt: string | null;
	language: string;
	hasAudio: boolean;
	audioUrl: string | null;
	published: boolean;
	isOfflineAvailable: boolean;
	publishedAt: string | null;
	position: number | null;
	createdAt: string;
	updatedAt: string;
	author: Author;
	categories: Category[];
}

export interface MalfuzatDetail extends MalfuzatListItem {
	body: string | null;
	documentUrl: string | null;
}

export interface MalfuzatAuthorOption {
	id: string;
	name: string;
	count: number;
}

export interface MalfuzatCategoryOption {
	id: string;
	title: string;
	count: number;
}

export interface MasailListItem {
	id: string;
	title: string;
	language: string;
	hasAudio: boolean;
	audioUrl: string | null;
	published: boolean;
	isOfflineAvailable: boolean;
	publishedAt: string | null;
	position: number;
	createdAt: string;
	updatedAt: string;
	author: Author | null;
	categories: Category[];
}

export interface MasailDetail extends MasailListItem {
	question: string;
	answer: string | null;
	documentUrl: string | null;
}

export interface MasailAuthorOption {
	id: string;
	name: string;
	count: number;
}

export interface MasailCategoryOption {
	id: string;
	title: string;
	count: number;
}

export interface DuaListItem {
	id: string;
	title: string;
	excerpt: string | null;
	language: string;
	audioUrl: string | null;
	published: boolean;
	isOfflineAvailable: boolean;
	position: number;
	createdAt: string;
	updatedAt: string;
	categories: Category[];
}

export interface DuaDetail extends DuaListItem {
	body: string;
	documentUrl: string | null;
}

export interface DuaCategoryOption {
	id: string;
	title: string;
	count: number;
}

export interface BayanListItem {
	id: string;
	title: string;
	excerpt: string | null;
	language: string;
	location: string | null;
	audioUrl: string | null;
	published: boolean;
	isOfflineAvailable: boolean;
	publishedAt: string;
	position: number;
	createdAt: string;
	updatedAt: string;
	author: Author;
	categories: Category[];
}

export type BayanDetail = BayanListItem;

export interface BayanAuthorOption {
	id: string;
	name: string;
	count: number;
}

export interface BayanCategoryOption {
	id: string;
	title: string;
	count: number;
}

export interface ArticleListItem {
	id: string;
	title: string;
	excerpt: string | null;
	language: string;
	published: boolean;
	isOfflineAvailable: boolean;
	publishedAt: string | null;
	position: number | null;
	createdAt: string;
	updatedAt: string;
	author: Author | null;
	categories: Category[];
}

export interface ArticleDetail extends ArticleListItem {
	body: string;
	documentUrl: string | null;
}

export interface ArticleAuthorOption {
	id: string;
	name: string;
	count: number;
}

export interface ArticleCategoryOption {
	id: string;
	title: string;
	count: number;
}

export interface NewsListItem {
	id: string;
	title: string;
	excerpt: string | null;
	language: string;
	published: boolean;
	publishedAt: string | null;
	position: number;
	createdAt: string;
	updatedAt: string;
}

export interface NewsDetail extends NewsListItem {
	body: string;
}

export interface PageListItem {
	id: string;
	title: string;
	slug: string;
	isOfflineAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PageDetail extends PageListItem {
	body: string;
	imageUrl: string | null;
}
