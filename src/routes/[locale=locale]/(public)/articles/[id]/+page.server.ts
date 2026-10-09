import { articleLd } from '#lib/json-ld.ts';
import { loadDetail } from '#lib/server/detail-page.ts';
import { getArticle, getArticles } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) =>
	loadDetail({
		locale: params.locale,
		id: params.id,
		section: 'articles',
		namespaces: ['ArticleDetail'],
		get: getArticle,
		related: (item) => getArticles({ authorId: item.author?.id, pageSize: 6 }),
		seo: (item) => ({
			description: item.excerpt,
			body: item.body,
			publishedAt: item.publishedAt ?? item.createdAt,
			authorName: item.author?.name,
			type: 'article'
		}),
		ld: (item, url) => [
			articleLd({
				title: item.title,
				description: item.excerpt,
				url,
				datePublished: item.publishedAt ?? item.createdAt,
				dateModified: item.updatedAt,
				authorName: item.author?.name
			})
		]
	});
