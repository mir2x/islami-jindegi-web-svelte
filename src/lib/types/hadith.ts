export interface HadithBook {
	id: number;
	slug: string;
	title: string;
	titleEn: string;
	titleAr: string | null;
	totalHadith: number;
	totalChapters: number;
}

export interface HadithChapter {
	id: number;
	chapterNumber: number;
	title: string;
	titleAr: string | null;
	totalHadith: number;
	rangeStart: number | null;
	rangeEnd: number | null;
}

export interface HadithBookDetail {
	id: number;
	slug: string;
	title: string;
	titleEn: string;
	titleAr: string | null;
	description: string | null;
	totalHadith: number;
	chapters: HadithChapter[];
}

export interface HadithItem {
	id: number;
	hadithNumber: number;
	title: string;
	titleAr: string | null;
	subTitle: string | null;
	description: string;
	descriptionAr: string | null;
	gradeBn: string | null;
	gradeEn: string | null;
	rabiNameBn: string | null;
	footNote: string | null;
	reference: string | null;
}

export interface HadithChapterDetail {
	book: HadithBook;
	chapter: HadithChapter;
	prev: HadithChapter | null;
	next: HadithChapter | null;
	hadiths: HadithItem[];
}

export interface HadithLocation {
	bookSlug: string;
	chapterId: number;
	hadithNumber: number;
}

export interface HadithSearchHit {
	id: number;
	bookSlug: string;
	bookTitle: string;
	chapterId: number;
	hadithNumber: number;
	description: string;
	descriptionAr: string | null;
	gradeBn: string | null;
}
