import { error } from '@sveltejs/kit';
import type { Tab, ListFilters } from '#lib/components/browser/types.ts';
import type { FilterOption } from '#lib/filters.ts';
import type { Locale } from '#lib/i18n/index.ts';
import { bn } from '#lib/bengali-numerals.ts';
import { hasListFilters, listCanonical, parsePageParam } from '#lib/list-paging.ts';
import type { ListOpts } from '#lib/list-query.ts';
import { buildSeo } from '#lib/seo.ts';
import type { PagedResult } from '#lib/types.ts';
import { getT, loadMessages } from './i18n.ts';

interface Options<T> {
	locale: Locale;
	url: URL;
	/** Message namespace of the module, e.g. `BayanPage`. */
	ns: string;
	/** Locale-less list path, e.g. `/bayan`. */
	basePath: string;
	list: (opts: ListOpts) => Promise<PagedResult<T> | null>;
	authors?: () => Promise<{ id: string; name: string; count: number }[]>;
	categories?: () => Promise<{ id: string; title: string; count: number }[]>;
	/** The module has all / text / audio tabs (`?tab=`). */
	tabs?: boolean;
	extraNamespaces?: string[];
}

/**
 * Shared `load` of the list/detail pages (articles, bayan, masail, malfuzat, dua): reads the URL's
 * filters, fetches the first page plus the filter options, and builds the head metadata.
 */
export async function loadListPage<T>(o: Options<T>) {
	const sp = Object.fromEntries(o.url.searchParams);
	const filtered = hasListFilters(sp);
	// `page` only applies to the plain list; a filtered view always starts at its first page.
	const page = filtered ? 1 : parsePageParam(sp.page);
	const tab: Tab = o.tabs && (sp.tab === 'text' || sp.tab === 'audio') ? sp.tab : 'all';
	const filters: ListFilters = {
		search: sp.q ?? '',
		category: sp.category ?? '',
		author: sp.author ?? '',
		tab,
		dateFrom: sp.dateFrom ?? '',
		dateTo: sp.dateTo ?? ''
	};

	const [result, authors, categories] = await Promise.all([
		o.list({
			page,
			search: filters.search,
			categoryId: filters.category,
			authorId: filters.author,
			dateFrom: filters.dateFrom,
			dateTo: filters.dateTo,
			hasAudio: tab === 'audio' ? true : tab === 'text' ? false : undefined
		}),
		o.authors?.() ?? [],
		o.categories?.() ?? []
	]);

	// Past the last page of the catalogue: a real 404, not an empty list.
	if (result && page > 1 && result.data.length === 0) error(404, 'Not found');

	const t = getT(o.locale, o.ns);
	const { path, paged } = listCanonical(o.basePath, page, filtered);
	const title = paged ? `${t('metaTitle')} — ${getT(o.locale, 'Common')('pageNumber', { number: o.locale === 'bn' ? bn(page) : page })}` : t('metaTitle');

	const options = (list: { id: string; count: number }[], label: 'name' | 'title'): FilterOption[] =>
		list.map((x) => ({ id: x.id, label: (x as unknown as Record<string, string>)[label], count: x.count }));

	return {
		initial: { items: result?.data ?? [], total: result?.total ?? 0, page, filters },
		authors: options(authors, 'name'),
		categories: options(categories, 'title'),
		heading: t('metaTitle'),
		msgs: loadMessages(o.locale, o.ns, ...(o.extraNamespaces ?? [])),
		seo: buildSeo({ locale: o.locale, title, description: t('metaDescription'), path })
	};
}
