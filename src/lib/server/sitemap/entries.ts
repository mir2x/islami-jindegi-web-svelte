import { getStrict as apiGet } from '../api.ts';
import type { SitemapEntry } from './render.ts';
import type { HadithBook, HadithBookDetail, MadrasahDetail, MadrasahListItem, NamazTimeListItem, PagedResult, TopicIndex } from '#lib/types.ts';

/**
 * Sitemap data layer. The index at /sitemap.xml and the per-section files under
 * /sitemaps/<section>-<n>.xml are route handlers, so the number of chunks is worked out at request
 * time: new content shows up without a rebuild. Helpers THROW on any failed API call; the route
 * caches successes only, so a failing API never publishes (and caches) a truncated sitemap.
 */

/** The API silently clamps pageSize to 100. */
const API_PAGE_SIZE = 100;
/** URLs per sitemap file. A multiple of API_PAGE_SIZE so a file maps onto whole API pages. */
const CHUNK_SIZE = 2000;
const PAGES_PER_CHUNK = CHUNK_SIZE / API_PAGE_SIZE;
const FETCH_CONCURRENCY = 5;

interface DatedItem {
	id: string;
	updatedAt?: string | null;
}

/** Paginated content types: sitemap section → list endpoint and public route. */
const LIST_SECTIONS = {
	bayan: { api: '/api/bayan', route: '/bayan' },
	masail: { api: '/api/masail', route: '/masail' },
	malfuzat: { api: '/api/malfuzat', route: '/malfuzat' },
	books: { api: '/api/books', route: '/books' },
	dua: { api: '/api/dua', route: '/dua' },
	articles: { api: '/api/articles', route: '/articles' },
	news: { api: '/api/news', route: '/news' }
} as const;

type ListSection = keyof typeof LIST_SECTIONS;
const isListSection = (s: string): s is ListSection => s in LIST_SECTIONS;

/**
 * `position_asc` is deliberate: new content is appended at the end, so the items in earlier
 * pages (and therefore earlier sitemap files) never shift when something is published.
 */
const listPage = (section: ListSection, page: number, pageSize: number) =>
	apiGet<PagedResult<DatedItem>>(
		`${LIST_SECTIONS[section].api}?${new URLSearchParams({
			published: 'true',
			sort: 'position_asc',
			page: String(page),
			pageSize: String(pageSize)
		})}`
	);

async function mapInBatches<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
	const out: R[] = [];
	for (let i = 0; i < items.length; i += FETCH_CONCURRENCY) {
		out.push(...(await Promise.all(items.slice(i, i + FETCH_CONCURRENCY).map(fn))));
	}
	return out;
}

/** lastmod must be a real modification time; omit it rather than guess. */
function toLastModified(value?: string | null): string | undefined {
	if (!value) return undefined;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

async function listChunkCount(section: ListSection): Promise<number> {
	const { total } = await listPage(section, 1, 1);
	return Math.ceil(total / CHUNK_SIZE);
}

async function listChunk(section: ListSection, chunk: number): Promise<SitemapEntry[]> {
	const first = (chunk - 1) * PAGES_PER_CHUNK + 1;
	// Page 1 of the chunk tells us the total, so we never request pages past the end.
	const head = await listPage(section, first, API_PAGE_SIZE);
	const lastPage = Math.ceil(head.total / API_PAGE_SIZE);
	const rest = Array.from({ length: PAGES_PER_CHUNK - 1 }, (_, i) => first + 1 + i).filter((p) => p <= lastPage);
	const results = [head, ...(await mapInBatches(rest, (p) => listPage(section, p, API_PAGE_SIZE)))];

	const seen = new Set<string>();
	const entries: SitemapEntry[] = [];
	for (const r of results) {
		for (const item of r.data) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			entries.push({ path: `${LIST_SECTIONS[section].route}/${item.id}`, lastModified: toLastModified(item.updatedAt) });
		}
	}
	return entries;
}

/** Hub and landing pages. Their content changes constantly, so no lastmod is claimed. */
const STATIC_PATHS = [
	'/',
	'/quran',
	'/books',
	'/articles',
	'/bayan',
	'/dua',
	'/masail',
	'/malfuzat',
	'/namaz-times',
	'/madrasah',
	'/news',
	'/topics',
	'/about',
	'/contact',
	'/donate',
	'/ask-masail',
	'/important-matters',
	'/privacy-policy'
];
const SURAH_COUNT = 114;

async function pagesEntries(): Promise<SitemapEntry[]> {
	const entries: SitemapEntry[] = STATIC_PATHS.map((path) => ({ path }));
	for (let n = 1; n <= SURAH_COUNT; n++) entries.push({ path: `/quran/surah/${n}` });

	const [topics, madrasahs, namazTimes] = await Promise.all([
		apiGet<TopicIndex>('/api/topics', true),
		apiGet<PagedResult<MadrasahListItem>>('/api/madrasahs?page=1&pageSize=100'),
		apiGet<PagedResult<NamazTimeListItem>>('/api/namaz-times?page=1&pageSize=100')
	]);

	// Topics are absent on API builds that predate them: skip, don't fail the file.
	for (const t of topics ? [...topics.ungrouped, ...topics.groups.flatMap((g) => g.topics)] : []) {
		if (t.slug) entries.push({ path: `/topics/${encodeURIComponent(t.slug)}` });
	}
	for (const m of namazTimes.data) entries.push({ path: `/namaz-times/${m.id}`, lastModified: toLastModified(m.updatedAt) });
	for (const m of madrasahs.data) entries.push({ path: `/madrasah/${m.id}`, lastModified: toLastModified(m.updatedAt) });

	const details = await mapInBatches(madrasahs.data, (m) => apiGet<MadrasahDetail>(`/api/madrasahs/${m.id}`, true));
	details.forEach((detail, i) => {
		if (!detail) throw new Error(`Sitemap: madrasah ${madrasahs.data[i].id} unavailable`);
		for (const info of detail.infos) {
			if (info.id) entries.push({ path: `/madrasah/${detail.id}/chapter/${info.id}`, lastModified: toLastModified(detail.updatedAt) });
		}
	});
	return entries;
}

/**
 * Hadith hub, book chapter lists and chapters. Books without chapters are skipped, as on the landing
 * page. The hadith endpoints are not on every API build; an empty list just yields an empty section.
 */
async function hadithEntries(): Promise<SitemapEntry[]> {
	const books = (await apiGet<HadithBook[]>('/api/hadith/books', true)) ?? [];
	if (!books.length) return [];

	const details = await mapInBatches(books, (b) => apiGet<HadithBookDetail>(`/api/hadith/books/${encodeURIComponent(b.slug)}`, true));
	const entries: SitemapEntry[] = [{ path: '/hadith' }];
	details.forEach((detail, i) => {
		if (!detail) throw new Error(`Sitemap: hadith book ${books[i].slug} unavailable`);
		if (!detail.chapters.length) return;
		entries.push({ path: `/hadith/${encodeURIComponent(detail.slug)}` });
		for (const c of detail.chapters) entries.push({ path: `/hadith/${encodeURIComponent(detail.slug)}/chapter/${c.id}` });
	});
	return entries;
}

/** Names of every sitemap file that currently has content, e.g. `bayan-1.xml`. */
export async function listSitemapFiles(): Promise<string[]> {
	const [counts, hadith] = await Promise.all([Promise.all((Object.keys(LIST_SECTIONS) as ListSection[]).map(async (s) => [s, await listChunkCount(s)] as const)), hadithEntries()]);
	const files = ['pages-1.xml'];
	for (const [section, chunks] of counts) for (let c = 1; c <= chunks; c++) files.push(`${section}-${c}.xml`);
	if (hadith.length) files.push('hadith-1.xml');
	return files;
}

/** Entries for one file name, or null when the name is not a valid file. */
export async function getSitemapEntries(file: string): Promise<SitemapEntry[] | null> {
	const m = /^([a-z]+)-([1-9]\d{0,3})\.xml$/.exec(file);
	if (!m) return null;
	const [, section, n] = m;
	const chunk = Number(n);

	if (isListSection(section)) {
		return chunk <= (await listChunkCount(section)) ? listChunk(section, chunk) : null;
	}
	if (chunk !== 1 || (section !== 'pages' && section !== 'hadith')) return null;
	const entries = section === 'pages' ? await pagesEntries() : await hadithEntries();
	return entries.length ? entries : null;
}
