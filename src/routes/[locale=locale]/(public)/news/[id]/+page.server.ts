import { articleLd } from '#lib/json-ld.ts';
import { loadDetail } from '#lib/server/detail-page.ts';
import { getNewsItem, getNewsList } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) =>
	loadDetail({
		locale: params.locale,
		id: params.id,
		section: 'news',
		namespaces: ['NewsDetail'],
		get: getNewsItem,
		related: async () => {
			const r = await getNewsList({ pageSize: 6 });
			return r && { data: r.data.map((n) => ({ id: n.id, title: n.title, publishedAt: n.publishedAt ?? n.createdAt })) };
		},
		seo: (item) => ({ description: item.excerpt, body: item.body, publishedAt: item.publishedAt ?? item.createdAt, type: 'article' }),
		ld: (item, url) => [
			articleLd({
				type: 'NewsArticle',
				title: item.title,
				description: item.excerpt || item.body,
				url,
				datePublished: item.publishedAt ?? item.createdAt,
				dateModified: item.updatedAt
			})
		]
	});
