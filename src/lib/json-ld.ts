import { NEXT_PUBLIC_SITE_URL as SITE } from '$app/env/public';
import { canonicalPath, htmlToPlainText } from './seo.ts';
import type { Locale } from '#lib/i18n/index.ts';

type Block = Record<string, unknown>;

export const absoluteUrl = (url: string) => (url.startsWith('http') ? url : `${SITE}${url.startsWith('/') ? url : `/${url}`}`);

const publisher = {
	'@type': 'Organization',
	name: 'Islami Jindegi',
	logo: { '@type': 'ImageObject', url: `${SITE}/logo-icon.png` }
};

export const webSiteLd = (locale: Locale): Block => ({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: locale === 'bn' ? 'ইসলামী যিন্দেগী' : 'Islami Jindegi',
	alternateName: locale === 'bn' ? 'Islami Jindegi' : 'ইসলামী যিন্দেগী',
	url: `${SITE}/${locale}`,
	potentialAction: {
		'@type': 'SearchAction',
		target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/${locale}/articles?q={search_term_string}` },
		'query-input': 'required name=search_term_string'
	}
});

export const organizationLd = (): Block => ({
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: 'Islami Jindegi',
	alternateName: 'ইসলামী যিন্দেগী',
	url: `${SITE}/bn`,
	logo: `${SITE}/logo-icon.png`,
	sameAs: ['https://www.facebook.com/islamijindegi', 'https://play.google.com/store/apps/details?id=com.islami_jindegi', 'https://apps.apple.com/app/id1271205014']
});

export const articleLd = (o: {
	title: string;
	description?: string | null;
	url: string;
	image?: string | null;
	datePublished?: string | null;
	dateModified?: string | null;
	authorName?: string | null;
	type?: 'Article' | 'NewsArticle';
}): Block => ({
	'@context': 'https://schema.org',
	'@type': o.type ?? 'Article',
	inLanguage: 'bn',
	mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(o.url) },
	headline: o.title,
	description: htmlToPlainText(o.description) || o.title,
	image: o.image ? absoluteUrl(o.image) : `${SITE}/images/og-default.png`,
	...(o.datePublished ? { datePublished: o.datePublished } : {}),
	...(o.dateModified ? { dateModified: o.dateModified } : {}),
	author: { '@type': 'Person', name: o.authorName || 'Islami Jindegi' },
	publisher
});

export const audioObjectLd = (o: { title: string; description?: string | null; url: string; audioUrl?: string | null; authorName?: string | null }): Block => ({
	'@context': 'https://schema.org',
	'@type': 'AudioObject',
	inLanguage: 'bn',
	name: o.title,
	description: o.description || o.title,
	contentUrl: o.audioUrl || absoluteUrl(o.url),
	url: absoluteUrl(o.url),
	...(o.authorName ? { author: { '@type': 'Person', name: o.authorName } } : {})
});

/** `items` run from the section down to the current page; the home page is prepended. */
export const breadcrumbLd = (locale: Locale, homeName: string, items: { name: string; path: string }[]): Block => ({
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: [{ name: homeName, path: '/' }, ...items].map((item, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: item.name,
		item: absoluteUrl(canonicalPath(locale, item.path))
	}))
});

export const qaPageLd = (o: { title: string; question: string; answer?: string | null; url: string; authorName?: string | null; datePublished?: string | null }): Block => {
	const answer = htmlToPlainText(o.answer, 5000);
	return {
		'@context': 'https://schema.org',
		'@type': 'QAPage',
		inLanguage: 'bn',
		url: absoluteUrl(o.url),
		mainEntity: {
			'@type': 'Question',
			name: o.title,
			text: htmlToPlainText(o.question, 5000) || o.title,
			answerCount: answer ? 1 : 0,
			...(o.datePublished ? { dateCreated: o.datePublished } : {}),
			...(answer
				? {
						acceptedAnswer: {
							'@type': 'Answer',
							text: answer,
							...(o.datePublished ? { dateCreated: o.datePublished } : {}),
							author: { '@type': 'Person', name: o.authorName || 'Islami Jindegi' }
						}
					}
				: {})
		}
	};
};

export const bookLd = (o: {
	name: string;
	description?: string | null;
	url: string;
	image?: string | null;
	authors?: string[];
	publisher?: string | null;
	datePublished?: string | null;
}): Block => ({
	'@context': 'https://schema.org',
	'@type': 'Book',
	inLanguage: 'bn',
	name: o.name,
	url: absoluteUrl(o.url),
	description: htmlToPlainText(o.description) || o.name,
	...(o.image ? { image: absoluteUrl(o.image) } : {}),
	...(o.authors?.length ? { author: o.authors.map((a) => ({ '@type': 'Person', name: a })) } : {}),
	...(o.publisher ? { publisher: { '@type': 'Organization', name: o.publisher } } : {}),
	...(o.datePublished ? { datePublished: o.datePublished } : {})
});
