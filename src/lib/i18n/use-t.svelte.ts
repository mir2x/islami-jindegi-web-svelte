import { page } from '$app/state';
import { createTranslator, DEFAULT_LOCALE, isLocale, type Locale, type Translator } from './index.ts';

/** The active locale, read from the `[locale]` route param. */
export const currentLocale = (): Locale => {
	const locale = page.params.locale;
	return isLocale(locale) ? locale : DEFAULT_LOCALE;
};

/**
 * Translator for one namespace. Messages arrive with the page data (`msgs`, or `chrome` for the
 * shared header/footer strings), so each page only ships the namespaces it uses. Call it in a
 * component's script and use the result in the template: it reads `page` lazily, so it stays
 * reactive across locale switches and client navigations.
 */
export function useT(namespace: string): Translator {
	const t = ((key: string, vars?: Record<string, string | number>) => {
		const ns = page.data.msgs?.[namespace] ?? page.data.chrome?.[namespace];
		return createTranslator(ns, currentLocale())(key, vars);
	}) as Translator;
	t.raw = <T>(key: string) => {
		const ns = page.data.msgs?.[namespace] ?? page.data.chrome?.[namespace];
		return createTranslator(ns, currentLocale()).raw<T>(key);
	};
	return t;
}

/** `/bn/bayan` for `l('/bayan')`: prefixes a locale-less path with the active locale. */
export const localePath = (path: string, locale: Locale = currentLocale()) => `/${locale}${path === '/' ? '' : path}`;
