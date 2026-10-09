import { loadListPage } from '#lib/server/list-page.ts';
import { getMasailAuthors, getMasailCategories, getMasails } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) =>
	loadListPage({
		locale: params.locale,
		url,
		ns: 'MasailPage',
		basePath: '/masail',
		tabs: true,
		list: getMasails,
		authors: getMasailAuthors,
		categories: getMasailCategories
	});
