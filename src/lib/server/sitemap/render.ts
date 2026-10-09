import { NEXT_PUBLIC_SITE_URL as SITE_URL } from '$app/env/public';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '#lib/i18n/index.ts';
import { isTranslatedPath } from '#lib/seo.ts';

/** Sitemap entry, locale-agnostic: `path` is relative to /{locale}. */
export interface SitemapEntry {
	path: string;
	lastModified?: string;
}

export const XML_HEADERS = { 'content-type': 'application/xml; charset=utf-8' };

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** The sitemap lists the default (Bangla) URL; translated pages add the others as hreflang alternates. */
const localizedUrl = (locale: Locale, path: string) => `${SITE_URL}/${locale}${path === '/' ? '' : path}`;

const alternateLink = (hreflang: string, href: string) => `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`;

export function renderUrlset(entries: SitemapEntry[]): string {
	const body = entries
		.map((e) => {
			// Only pages that really exist in both languages declare an hreflang set; the rest are
			// Bangla-only (their /en URLs canonicalise to /bn), so listing /en would contradict the markup.
			const alternates = isTranslatedPath(e.path)
				? [...LOCALES.map((l) => alternateLink(l, localizedUrl(l, e.path))), alternateLink('x-default', localizedUrl(DEFAULT_LOCALE, e.path))].join('')
				: '';
			const lastmod = e.lastModified ? `<lastmod>${e.lastModified}</lastmod>` : '';
			return `<url><loc>${escapeXml(localizedUrl(DEFAULT_LOCALE, e.path))}</loc>${alternates}${lastmod}</url>`;
		})
		.join('\n');

	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
		`${body}\n</urlset>\n`
	);
}

export function renderIndex(files: string[]): string {
	const body = files.map((f) => `<sitemap><loc>${escapeXml(`${SITE_URL}/sitemaps/${f}`)}</loc></sitemap>`).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n` + `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + `${body}\n</sitemapindex>\n`;
}
