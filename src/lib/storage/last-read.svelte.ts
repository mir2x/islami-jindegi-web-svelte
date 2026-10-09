import { StoredValue } from './stored.svelte.ts';

export interface QuranLastRead {
	surahNumber: number;
	surahName: string;
	ayahNumber: number;
	updatedAt: string;
}

export interface HadithLastRead {
	bookSlug: string;
	bookTitle: string;
	chapterId: number;
	hadithNumber: number;
	updatedAt: string;
}

/** "Continue reading" position, remembered per reader. Null on the server and until read. */
class LastRead<T extends { updatedAt: string }> {
	store: StoredValue<T | null>;
	constructor(key: string) {
		this.store = new StoredValue<T | null>(key, null);
	}
	get current() {
		return this.store.current;
	}
	set = (entry: Omit<T, 'updatedAt'>) => this.store.set({ ...entry, updatedAt: new Date().toISOString() } as T);
}

export const quranLastRead = new LastRead<QuranLastRead>('quran_last_read');
export const hadithLastRead = new LastRead<HadithLastRead>('hadith_last_read');
