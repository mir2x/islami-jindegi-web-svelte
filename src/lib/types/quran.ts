export interface AyahBox {
	ayah_number: number;
	box_id: number;
	max_x: number;
	max_y: number;
	min_x: number;
	min_y: number;
	page_number: number;
	sura_number: number;
}

export interface MushafEdition {
	id: string;
	title: string;
	width: number;
	height: number;
	ext: string;
	totalPages: number;
	pagesBaseUrl: string;
	ayahBoxesUrl: string;
}

export interface QuranSurah {
	number: number;
	nameArabic: string;
	nameBengali: string;
	nameEnglish: string;
	transliteration: string;
	totalAyahs: number;
	revelationType: 'Meccan' | 'Medinan';
	paraNumber: number;
}

export interface QuranWord {
	id: number;
	arabic: string;
	bengali: string;
}

export interface QuranTranslation {
	translator: string;
	text: string;
}

export interface QuranTafsir {
	id: string;
	name: string;
	text: string;
}

export interface QuranAyah {
	number: number;
	arabic: string;
	translations: QuranTranslation[];
	words: QuranWord[];
	tafsirs: QuranTafsir[];
}

// The surah-detail endpoint (`/api/quran/surahs/{n}/ayahs`) returns `surahNumber`, not `number`
// like the surah-list endpoint — Omit + explicit field keeps this type honest about that.

export interface QuranSurahDetail extends Omit<QuranSurah, 'number'> {
	surahNumber: number;
	ayahs: QuranAyah[];
}

export interface QuranAyahDetail {
	surahNumber: number;
	ayahNumber: number;
	arabic: string;
	translations: QuranTranslation[];
	words: QuranWord[];
	tafsirs: QuranTafsir[];
}

export interface QuranReciter {
	id: string;
	name: string;
}

export interface QuranSearchHit {
	surahNumber: number;
	surahName: string;
	ayahNumber: number;
	arabic: string;
	translations: QuranTranslation[];
}

export interface SuraAudioUrls {
	urls: string[];
	totalAyahs: number;
	totalDownloadSizeBytes: number;
	totalDownloadSizeMB: number;
}
