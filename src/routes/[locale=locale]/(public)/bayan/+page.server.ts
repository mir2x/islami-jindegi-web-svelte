import { loadListPage } from '#lib/server/list-page.ts';
import { getBayanAuthors, getBayanCategories, getBayans } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) =>
	loadListPage({
		locale: params.locale,
		url,
		ns: 'BayanPage',
		basePath: '/bayan',
		list: getBayans,
		authors: getBayanAuthors,
		categories: getBayanCategories
	});
