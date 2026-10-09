import type { Author, Category } from './content.ts';

export interface Book {
	id: string;
	title: string;
	excerpt: string | null;
	publisher: string | null;
	price: string | null;
	language: string;
	coverUrl: string | null;
	documentUrl: string | null;
	position: number;
	publishedAt: string | null;
	published: boolean;
	isOfflineAvailable: boolean;
	createdAt: string;
	updatedAt: string;
	authors: Author[];
	categories: Category[];
	chapterCount: number;
}

export interface SubChapter {
	id: string;
	title: string;
	body: string | null;
	position: number;
	parentSubChapterId: string | null;
}

export interface Chapter {
	id: string;
	title: string;
	body: string | null;
	position: number;
	subChapters: SubChapter[];
}

export interface BookDetail extends Book {
	chapters: Chapter[];
}

export interface BookAuthorOption {
	id: string;
	name: string;
	count: number;
}

export interface BookCategoryOption {
	id: string;
	title: string;
	count: number;
}
