import { loadListPage } from '#lib/server/list-page.ts';
import { getBookAuthors, getBookCategories, getBooks } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) =>
	loadListPage({
		locale: params.locale,
		url,
		ns: 'BooksPage',
		basePath: '/books',
		list: getBooks,
		authors: getBookAuthors,
		categories: getBookCategories
	});
