import { DEFAULT_LOCALE, type Locale } from '#lib/i18n/index.ts';

const DEFAULT_OG_IMAGE = '/images/og-default.png';
/** Meta descriptions are cut to this length (search engines truncate around 155-160). */
const DESCRIPTION_LENGTH = 160;

export interface SeoData {
	/** Full `<title>` text. */
	title: string;
	description: string;
	keywords?: string[];
	/** Locale-prefixed path; made absolute when rendered. */
	canonical: string;
	/** hreflang → path, only for pages that exist in both languages. */
	languages?: Record<string, string>;
	og: {
		title: string;
		description: string;
		url: string;
		siteName: string;
		locale: string;
		alternateLocale?: string;
		type: 'website' | 'article' | 'music.song';
		image: string;
		imageAlt: string;
		publishedTime?: string;
		authors?: string[];
	};
	/** schema.org blocks (see json-ld.ts). */
	jsonLd?: Record<string, unknown>[];
	/** Keep the page out of search results (it still follows links). */
	noindex?: boolean;
}

/** Strips markup from CMS HTML for use in a meta description (no DOM needed). */
export function htmlToPlainText(html: string | null | undefined, maxLength = DESCRIPTION_LENGTH): string {
	const text = (html ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

/**
 * Paths whose content really exists in both languages (UI-driven, not CMS text).
 *
 * Everything else (articles, bayan, books, the CMS pages, ...) is Bangla content: the API holds a
 * single Bangla body and `/en` only translates the surrounding interface. Those `/en` URLs would be
 * near-duplicates of `/bn`, so they canonicalise to the Bangla URL and carry no hreflang pair.
 * The sitemap uses this same list, so markup and sitemap cannot disagree.
 */
const TRANSLATED_PATHS = ['/', '/namaz-times'];

/** '/'-prefixed, without a trailing slash; the root becomes ''. */
function normalizePath(path: string): string {
	const p = path.startsWith('/') ? path : `/${path}`;
	return p === '/' ? '' : p.replace(/\/$/, '');
}

export function isTranslatedPath(path: string): boolean {
	const clean = normalizePath(path);
	return TRANSLATED_PATHS.includes(clean === '' ? '/' : clean);
}

/** Canonical URL path for `path` as served in `locale`. */
export function canonicalPath(locale: Locale, path: string, translated = isTranslatedPath(path)): string {
	return `/${translated ? locale : DEFAULT_LOCALE}${normalizePath(path)}`;
}

const brandOf = (locale: Locale) => (locale === 'bn' ? 'ইসলামী যিন্দেগী' : 'Islami Jindegi');

function ogLocale(locale: Locale, translated: boolean) {
	if (!translated) return { locale: 'bn_BD' };
	return locale === 'bn' ? { locale: 'bn_BD', alternateLocale: 'en_US' } : { locale: 'en_US', alternateLocale: 'bn_BD' };
}

export interface SeoOptions {
	locale: Locale;
	title: string;
	description?: string | null;
	/** CMS HTML used for the description when there is no `description`. */
	body?: string | null;
	/** Locale-less path, e.g. `/bayan/123` or `/bayan?page=2`. */
	path: string;
	image?: string | null;
	keywords?: string[];
	/** Override the default per-path locale policy (see TRANSLATED_PATHS). */
	translated?: boolean;
	/** The title already carries the brand: skip the "| brand" suffix. */
	absoluteTitle?: boolean;
	type?: SeoData['og']['type'];
	publishedAt?: string | null;
	authorName?: string | null;
	jsonLd?: Record<string, unknown>[];
	noindex?: boolean;
}

/** Title, canonical, hreflang and Open Graph for any public page (listing or detail). */
export function buildSeo(o: SeoOptions): SeoData {
	const translated = o.translated ?? isTranslatedPath(o.path);
	const brand = brandOf(o.locale);
	const clean = normalizePath(o.path.split('?')[0]);
	const query = o.path.includes('?') ? `?${o.path.split('?')[1]}` : '';
	const canonical = `${canonicalPath(o.locale, clean, translated)}${query}`;

	// CMS fields can hold HTML, so every candidate is reduced to plain text before use.
	const description =
		htmlToPlainText(o.description) ||
		htmlToPlainText(o.body) ||
		// Audio-only items have no text to quote: name the speaker so descriptions stay distinct.
		(o.authorName ? `${o.title} — ${o.authorName}` : `${o.title} — ${brand}`);

	const title = o.absoluteTitle ? o.title : `${o.title} | ${brand}`;

	return {
		title,
		description,
		keywords: o.keywords ?? ([brand, o.title, o.authorName].filter(Boolean) as string[]),
		canonical,
		languages: translated ? { bn: `/bn${clean}`, en: `/en${clean}`, 'x-default': `/${DEFAULT_LOCALE}${clean}` } : undefined,
		og: {
			title,
			description,
			url: canonical,
			siteName: brand,
			...ogLocale(o.locale, translated),
			type: o.type ?? 'website',
			image: o.image || DEFAULT_OG_IMAGE,
			imageAlt: o.title,
			publishedTime: o.publishedAt ?? undefined,
			authors: o.authorName ? [o.authorName] : undefined
		},
		jsonLd: o.jsonLd,
		noindex: o.noindex
	};
}
