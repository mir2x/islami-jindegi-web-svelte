import { error } from '@sveltejs/kit';
import type { Locale } from '#lib/i18n/index.ts';
import { breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo, canonicalPath, type SeoOptions } from '#lib/seo.ts';
import { getT, loadMessages } from './i18n.ts';

interface RelatedItem {
	id: string;
	title: string;
	author?: { name: string } | null;
	publishedAt?: string | null;
}

interface Options<T extends { id: string; title: string }> {
	locale: Locale;
	id: string;
	/** Locale-less list path and `Nav` message key in one: `masail` → `/masail`. */
	section: string;
	/** Message namespaces the detail page uses. */
	namespaces: string[];
	get: (id: string) => Promise<T | null>;
	/** Other items to suggest ("more from this author"); the current item is filtered out. */
	related?: (item: T) => Promise<{ data: RelatedItem[] } | null>;
	seo: (item: T) => Omit<SeoOptions, 'locale' | 'path' | 'title' | 'jsonLd'>;
	/** schema.org blocks for the page; the breadcrumb is added automatically. */
	ld: (item: T, canonicalUrl: string) => Record<string, unknown>[];
}

/** Shared `load` of a content detail page: 404 when missing, related items, head metadata and JSON-LD. */
export async function loadDetail<T extends { id: string; title: string }>(o: Options<T>) {
	const item = await o.get(o.id);
	if (!item) error(404, 'Not found');

	const related = o.related ? await o.related(item) : null;
	const path = `/${o.section}/${item.id}`;
	const sectionName = getT(o.locale, 'Nav')(o.section);

	return {
		item,
		more: (related?.data ?? [])
			.filter((r) => r.id !== item.id)
			.slice(0, 5)
			.map((r) => ({ id: r.id, title: r.title, author: r.author?.name ?? null, date: r.publishedAt ?? null })),
		msgs: loadMessages(o.locale, ...o.namespaces),
		seo: buildSeo({
			...o.seo(item),
			locale: o.locale,
			title: item.title,
			path,
			jsonLd: [
				...o.ld(item, canonicalPath(o.locale, path)),
				breadcrumbLd(o.locale, getT(o.locale, 'Metadata')('title'), [
					{ name: sectionName, path: `/${o.section}` },
					{ name: item.title, path }
				])
			]
		})
	};
}
