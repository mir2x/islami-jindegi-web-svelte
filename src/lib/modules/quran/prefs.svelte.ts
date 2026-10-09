import { arabicFont, bengaliFont } from '#lib/storage/fonts.svelte.ts';
import { StoredValue } from '#lib/storage/stored.svelte.ts';

const DEFAULT_TRANSLATOR = 'মুফতী তাকী উসমানী';
const DEFAULT_RECITER = 'qari-maher-al-muaiqly';

export const ARABIC_SIZE = { min: 22, max: 48, step: 2, fallback: 30 };
export const BENGALI_SIZE = { min: 13, max: 24, step: 1, fallback: 16 };

const translatorsStore = new StoredValue<string[]>('quran_selected_translators', []);
const reciterStore = new StoredValue<string>('quran_selected_reciter', '', { bare: true });
const arabicSizeStore = new StoredValue<number>('quran_arabic_font_size', ARABIC_SIZE.fallback);
const bengaliSizeStore = new StoredValue<number>('quran_bengali_font_size', BENGALI_SIZE.fallback);

type Range = typeof ARABIC_SIZE;
const clamp = (v: number, r: Range) => (v >= r.min && v <= r.max ? v : r.fallback);
const step = (store: StoredValue<number>, r: Range, dir: 1 | -1) => store.set(Math.min(r.max, Math.max(r.min, clamp(store.read(), r) + dir * r.step)));

/** The Quran readers' display and audio preferences, remembered across visits. */
export const quranPrefs = {
	arabicFont,
	bengaliFont,
	get arabicSize() {
		return clamp(arabicSizeStore.current, ARABIC_SIZE);
	},
	get bengaliSize() {
		return clamp(bengaliSizeStore.current, BENGALI_SIZE);
	},
	stepArabic: (dir: 1 | -1) => step(arabicSizeStore, ARABIC_SIZE, dir),
	stepBengali: (dir: 1 | -1) => step(bengaliSizeStore, BENGALI_SIZE, dir),

	/** The saved translators that still exist, else the default one (else the first available). */
	translators(available: string[]): string[] {
		const valid = translatorsStore.current.filter((t) => available.includes(t));
		if (valid.length > 0) return valid;
		return available.includes(DEFAULT_TRANSLATOR) ? [DEFAULT_TRANSLATOR] : available.slice(0, 1);
	},
	toggleTranslator(name: string, available: string[]) {
		const current = quranPrefs.translators(available);
		translatorsStore.set(current.includes(name) ? current.filter((x) => x !== name) : [...current, name]);
	},

	reciter(available: { id: string }[]): string {
		const saved = reciterStore.current;
		if (saved && available.some((r) => r.id === saved)) return saved;
		return available.some((r) => r.id === DEFAULT_RECITER) ? DEFAULT_RECITER : (available[0]?.id ?? '');
	},
	setReciter: (id: string) => reciterStore.set(id)
};

/** CSS custom properties the reader components read their fonts and sizes from. */
export const quranFontVars = () =>
	`--quran-arabic-font: ${arabicFont.family}; --quran-bengali-font: ${bengaliFont.family}; --quran-arabic-size: ${quranPrefs.arabicSize}px; --quran-bengali-size: ${quranPrefs.bengaliSize}px`;
