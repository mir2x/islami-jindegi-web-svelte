import { loadListPage } from '#lib/server/list-page.ts';
import { getDuaCategories, getDuas } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) =>
	loadListPage({
		locale: params.locale,
		url,
		ns: 'DuaPage',
		basePath: '/dua',
		tabs: true,
		list: getDuas,
		categories: getDuaCategories
	});
