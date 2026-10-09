import { articleLd } from '#lib/json-ld.ts';
import { loadDetail } from '#lib/server/detail-page.ts';
import { getDua, getDuas } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) =>
	loadDetail({
		locale: params.locale,
		id: params.id,
		section: 'dua',
		namespaces: ['DuaDetail'],
		get: getDua,
		related: (item) => getDuas({ categoryId: item.categories[0]?.id, pageSize: 6 }),
		seo: (item) => ({ description: item.excerpt, body: item.body, publishedAt: item.createdAt, type: 'article' }),
		ld: (item, url) => [articleLd({ title: item.title, description: item.excerpt || item.body, url, datePublished: item.createdAt, dateModified: item.updatedAt })]
	});
