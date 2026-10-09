import type {
	ArticleAuthorOption,
	ArticleCategoryOption,
	ArticleDetail,
	ArticleListItem,
	BayanAuthorOption,
	BayanCategoryOption,
	BayanDetail,
	BayanListItem,
	Book,
	BookAuthorOption,
	BookCategoryOption,
	BookDetail,
	DuaCategoryOption,
	DuaDetail,
	DuaListItem,
	MadrasahDetail,
	MadrasahListItem,
	MalfuzatAuthorOption,
	MalfuzatCategoryOption,
	MalfuzatDetail,
	MalfuzatListItem,
	MasailAuthorOption,
	MasailCategoryOption,
	MasailDetail,
	MasailListItem,
	NamazTimeDetail,
	NamazTimeListItem,
	NewsDetail,
	NewsListItem,
	PagedResult,
	PageDetail,
	TopicDetail,
	TopicIndex
} from '#lib/types.ts';
import { MODULE_DEFAULT_SORT as SORT } from '#lib/modules.ts';
import { DATED_FILTERS, listQuery, type ListFilter, type ListOpts } from '#lib/list-query.ts';
import { get } from './api.ts';

/** Paged published list for one module. */
function listOf<T>(api: string, sort: string, pageSize: number, filters: ListFilter[] = DATED_FILTERS) {
	return (opts: ListOpts = {}) => get<PagedResult<T>>(`${api}?${listQuery(sort, pageSize, filters, opts)}`, 120);
}

/** The first `pageSize` published items, for home-page and "more like this" blocks. */
function recentOf<T>(api: string, sort: string, defaultSize: number) {
	return async (pageSize = defaultSize) => (await get<PagedResult<T>>(`${api}?page=1&pageSize=${pageSize}&published=true&sort=${sort}`, 180))?.data ?? [];
}

const detailOf =
	<T>(api: string) =>
	(id: string) =>
		get<T>(`${api}/${id}`, 300);
const optionsOf =
	<T>(path: string) =>
	async () =>
		(await get<T[]>(`${path}?published=true`, 600)) ?? [];

// ── Books ────────────────────────────────────────────────────────────────────
export const getBooks = listOf<Book>('/api/books', SORT.book, 24);
export const getRecentBooks = recentOf<Book>('/api/books', SORT.book, 10);
export const getBook = detailOf<BookDetail>('/api/books');
export const getBookAuthors = optionsOf<BookAuthorOption>('/api/books/authors');
export const getBookCategories = optionsOf<BookCategoryOption>('/api/books/categories');

// ── Bayan ────────────────────────────────────────────────────────────────────
export const getBayans = listOf<BayanListItem>('/api/bayan', SORT.bayan, 20);
export const getRecentBayans = recentOf<BayanListItem>('/api/bayan', SORT.bayan, 10);
export const getBayan = detailOf<BayanDetail>('/api/bayan');
export const getBayanAuthors = optionsOf<BayanAuthorOption>('/api/bayan/authors');
export const getBayanCategories = optionsOf<BayanCategoryOption>('/api/bayan/categories');

// ── Malfuzat ─────────────────────────────────────────────────────────────────
export const getMalfuzats = listOf<MalfuzatListItem>('/api/malfuzat', SORT.malfuzat, 20, [...DATED_FILTERS, 'hasAudio']);
export const getRecentMalfuzat = recentOf<MalfuzatListItem>('/api/malfuzat', SORT.malfuzat, 8);
export const getMalfuzat = detailOf<MalfuzatDetail>('/api/malfuzat');
export const getMalfuzatAuthors = optionsOf<MalfuzatAuthorOption>('/api/malfuzat/authors');
export const getMalfuzatCategories = optionsOf<MalfuzatCategoryOption>('/api/malfuzat/categories');

// ── Masail ───────────────────────────────────────────────────────────────────
export const getMasails = listOf<MasailListItem>('/api/masail', SORT.masail, 20, [...DATED_FILTERS, 'hasAudio']);
export const getMasail = detailOf<MasailDetail>('/api/masail');
export const getMasailAuthors = optionsOf<MasailAuthorOption>('/api/masail/authors');
export const getMasailCategories = optionsOf<MasailCategoryOption>('/api/masail/categories');

// ── Dua (no authors and no date filter or date sort on the endpoint) ─────────
export const getDuas = listOf<DuaListItem>('/api/dua', SORT.dua, 20, ['search', 'categoryId', 'hasAudio']);
export const getDua = detailOf<DuaDetail>('/api/dua');
export const getDuaCategories = optionsOf<DuaCategoryOption>('/api/dua/categories');

// ── Articles ─────────────────────────────────────────────────────────────────
export const getArticles = listOf<ArticleListItem>('/api/articles', SORT.article, 20);
export const getRecentArticles = recentOf<ArticleListItem>('/api/articles', SORT.article, 6);
export const getArticle = detailOf<ArticleDetail>('/api/articles');
export const getArticleAuthors = optionsOf<ArticleAuthorOption>('/api/articles/authors');
export const getArticleCategories = optionsOf<ArticleCategoryOption>('/api/articles/categories');

// ── News ─────────────────────────────────────────────────────────────────────
export const getNewsList = listOf<NewsListItem>('/api/news', SORT.news, 20, ['search']);
export const getRecentNews = recentOf<NewsListItem>('/api/news', SORT.news, 6);
export const getNewsItem = detailOf<NewsDetail>('/api/news');

// ── Madrasah, namaz times, pages, topics ─────────────────────────────────────
export function getMadrasahs(opts: { page?: number; search?: string } = {}) {
	const q = new URLSearchParams({ page: String(opts.page ?? 1), pageSize: '20' });
	if (opts.search) q.set('search', opts.search);
	return get<PagedResult<MadrasahListItem>>(`/api/madrasahs?${q}`, 120);
}
export const getMadrasah = detailOf<MadrasahDetail>('/api/madrasahs');

export async function getNamazTimes() {
	return (await get<PagedResult<NamazTimeListItem>>('/api/namaz-times?page=1&pageSize=20', 3600))?.data ?? [];
}
export const getNamazTimeDetail = (id: string) => get<NamazTimeDetail>(`/api/namaz-times/${id}`, 3600);

/** CMS-managed static pages, addressed by slug (e.g. 'donation'). */
export const getPageBySlug = (slug: string) => get<PageDetail>(`/api/pages/by-slug/${slug}`, 600);

/** বিষয়ভিত্তিক index: every topic with its per-module counts. */
export const getTopics = () => get<TopicIndex>('/api/topics', 600);
/** One topic by slug or category id, with the first items of each module. */
export const getTopic = (key: string) => get<TopicDetail>(`/api/topics/${encodeURIComponent(key)}`, 300);
