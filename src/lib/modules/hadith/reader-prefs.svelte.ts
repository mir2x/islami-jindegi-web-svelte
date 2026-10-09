import { arabicFont, bengaliFont } from '#lib/storage/fonts.svelte.ts';
import { StoredValue } from '#lib/storage/stored.svelte.ts';

// Hadith Arabic is running prose, not verse, so it defaults well below the Quran reader's size.
export const ARABIC_SIZE = { min: 18, max: 40, step: 2, fallback: 28 };
export const BENGALI_SIZE = { min: 13, max: 26, step: 1, fallback: 19 };

const showArabicStore = new StoredValue<boolean>('hadith_show_arabic', true);
const arabicSizeStore = new StoredValue<number>('hadith_arabic_font_size', ARABIC_SIZE.fallback);
const bengaliSizeStore = new StoredValue<number>('hadith_bengali_font_size', BENGALI_SIZE.fallback);

const clamp = (v: number, { min, max, fallback }: typeof ARABIC_SIZE) => (v >= min && v <= max ? v : fallback);

/** The hadith reader's display preferences, remembered across visits (and shared with the font settings page). */
export const readerPrefs = {
	get showArabic() {
		return showArabicStore.current;
	},
	set showArabic(v: boolean) {
		showArabicStore.set(v);
	},
	get arabicSize() {
		return clamp(arabicSizeStore.current, ARABIC_SIZE);
	},
	get bengaliSize() {
		return clamp(bengaliSizeStore.current, BENGALI_SIZE);
	},
	stepArabic: (dir: 1 | -1) => arabicSizeStore.set(Math.min(ARABIC_SIZE.max, Math.max(ARABIC_SIZE.min, clamp(arabicSizeStore.read(), ARABIC_SIZE) + dir * ARABIC_SIZE.step))),
	stepBengali: (dir: 1 | -1) =>
		bengaliSizeStore.set(Math.min(BENGALI_SIZE.max, Math.max(BENGALI_SIZE.min, clamp(bengaliSizeStore.read(), BENGALI_SIZE) + dir * BENGALI_SIZE.step))),
	arabicFont,
	bengaliFont
};
