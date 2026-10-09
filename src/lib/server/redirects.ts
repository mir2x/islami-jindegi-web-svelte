import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/index.ts';

/** Old Ember-era URLs (with or without a locale prefix) → current path. Query strings are kept. */
const LEGACY: [RegExp, (m: RegExpMatchArray) => string][] = [
	[/^\/duas(\/.*)?$/, (m) => `/dua${m[1] ?? ''}`],
	[/^\/bayans(\/.*)?$/, (m) => `/bayan${m[1] ?? ''}`],
	[/^\/contact-us$/, () => '/contact'],
	[/^\/donation$/, () => '/donate'],
	[/^\/madrasahs(\/.*)?$/, () => '/madrasah']
];

/**
 * Paths that never carry a locale: API routes, framework internals, .well-known, and anything with a
 * file extension (sitemap.xml, robots.txt, bot probes like /wp-login.php, which should simply 404).
 */
const isLocaleless = (pathname: string) =>
	pathname === '/api' || pathname.startsWith('/api/') || pathname.startsWith('/_app/') || pathname.startsWith('/.well-known/') || pathname.includes('.');

export interface Redirect {
	location: string;
	/** True when the locale prefix itself was missing (those redirects must never be cached). */
	addedLocale: boolean;
}

/**
 * Where a request should be redirected (308), or null when it should be served as is. Locale
 * detection is deliberately off: every un-prefixed URL, including `/`, lands on `/bn/...`.
 */
export function resolveRedirect(pathname: string, search: string): Redirect | null {
	if (isLocaleless(pathname)) return null;

	const [, first, ...rest] = pathname.split('/');
	const prefixed = isLocale(first);
	const locale = prefixed ? first : DEFAULT_LOCALE;
	const path = prefixed ? `/${rest.join('/')}`.replace(/\/$/, '') : pathname;

	for (const [pattern, to] of LEGACY) {
		const match = path.match(pattern);
		if (match) return { location: `/${locale}${to(match)}${search}`, addedLocale: !prefixed };
	}
	if (!prefixed) return { location: `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}${search}`, addedLocale: true };
	return null;
}
