import type { Locale } from '#lib/i18n/index.ts';

const tag = (locale: Locale) => (locale === 'bn' ? 'bn-BD' : 'en-GB');

/** Whole numbers with the locale's digits (Bangla digits in Bangla). */
export const fmt = (n: number, locale: Locale) => new Intl.NumberFormat(tag(locale)).format(Math.round(n));

export const fmtCompact = (n: number, locale: Locale) => new Intl.NumberFormat(tag(locale), { notation: 'compact', maximumFractionDigits: 1 }).format(n);

/** `2026-11-16` as "16 Nov". */
export const shortDay = (iso: string, locale: Locale) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(tag(locale), { day: 'numeric', month: 'short', timeZone: 'UTC' });

export const clock = (iso: string, locale: Locale) => new Date(iso).toLocaleTimeString(tag(locale), { hour: '2-digit', minute: '2-digit' });

/** Percent change from `prev` to `cur`; null when there is nothing to compare with. */
export const change = (cur: number, prev: number | undefined | null) => (prev && prev > 0 ? ((cur - prev) / prev) * 100 : null);

/** "BD" as "Bangladesh" in the reader's language; anything else unchanged. */
export function countryName(code: string, locale: Locale): string {
	try {
		return new Intl.DisplayNames([tag(locale)], { type: 'region' }).of(code) ?? code;
	} catch {
		return code;
	}
}
