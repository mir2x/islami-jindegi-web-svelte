import { loadListPage } from '#lib/server/list-page.ts';
import { getMalfuzatAuthors, getMalfuzatCategories, getMalfuzats } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) =>
	loadListPage({
		locale: params.locale,
		url,
		ns: 'MalfuzatPage',
		basePath: '/malfuzat',
		tabs: true,
		list: getMalfuzats,
		authors: getMalfuzatAuthors,
		categories: getMalfuzatCategories
	});
