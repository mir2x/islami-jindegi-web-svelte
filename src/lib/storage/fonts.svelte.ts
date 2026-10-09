import { ARABIC_FONT_KEY, ARABIC_FONTS, arabicFontFamily, BENGALI_FONT_KEY, BENGALI_FONTS, bengaliFontFamily } from '#lib/quran-fonts.ts';
import { StoredValue } from './stored.svelte.ts';

/** The reader/settings font choices (stored as a bare string, shared with the old site's keys). */
class FontChoice {
	#store: StoredValue<string>;
	#family: (key: string) => string;

	constructor(storageKey: string, fonts: { key: string }[], family: (key: string) => string) {
		this.#family = family;
		this.#store = new StoredValue<string>(storageKey, fonts[0].key, { bare: true });
	}
	get key(): string {
		return this.#store.current;
	}
	get family(): string {
		return this.#family(this.key);
	}
	set(key: string) {
		this.#store.set(key);
	}
}

export const arabicFont = new FontChoice(ARABIC_FONT_KEY, ARABIC_FONTS, arabicFontFamily);
export const bengaliFont = new FontChoice(BENGALI_FONT_KEY, BENGALI_FONTS, bengaliFontFamily);
