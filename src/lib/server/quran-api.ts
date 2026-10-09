import type { HadithBook, HadithBookDetail, HadithChapterDetail, HadithLocation, MushafEdition, QuranReciter, QuranSurah, QuranSurahDetail } from '#lib/types.ts';
import { get } from './api.ts';

const DAY = 86400;

export const getMushafs = async (): Promise<MushafEdition[]> => (await get<MushafEdition[]>('/api/quran/mushafs', 3600)) ?? [];
export const getQuranSurahs = async (): Promise<QuranSurah[]> => (await get<QuranSurah[]>('/api/quran/surahs', DAY)) ?? [];
export const getQuranReciters = async (): Promise<QuranReciter[]> => (await get<QuranReciter[]>('/api/quran/reciters', 3600)) ?? [];
export const getQuranTranslators = async (): Promise<string[]> => (await get<string[]>('/api/quran/translators', 3600)) ?? [];

/**
 * Always fetches all translations (the default), so the reader can switch translations client-side
 * without refetching. Tafsirs are fetched on demand per ayah when a tafsir panel opens.
 */
export const getQuranSurah = (number: number): Promise<QuranSurahDetail | null> => get<QuranSurahDetail>(`/api/quran/surahs/${number}/ayahs`, DAY);

export const getHadithBooks = async (): Promise<HadithBook[]> => (await get<HadithBook[]>('/api/hadith/books', DAY)) ?? [];
export const getHadithBook = (slug: string) => get<HadithBookDetail>(`/api/hadith/books/${encodeURIComponent(slug)}`, DAY);
export const getHadithChapter = (slug: string, chapterId: number) => get<HadithChapterDetail>(`/api/hadith/books/${encodeURIComponent(slug)}/chapters/${chapterId}`, DAY);
export const getHadithLocation = (slug: string, number: number) => get<HadithLocation>(`/api/hadith/books/${encodeURIComponent(slug)}/hadiths/${number}`, DAY);
