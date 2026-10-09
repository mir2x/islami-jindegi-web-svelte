import { articleLd } from '#lib/json-ld.ts';
import { loadDetail } from '#lib/server/detail-page.ts';
import { getMalfuzat, getMalfuzats } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) =>
	loadDetail({
		locale: params.locale,
		id: params.id,
		section: 'malfuzat',
		namespaces: ['MalfuzatDetail'],
		get: getMalfuzat,
		related: (item) => getMalfuzats({ authorId: item.author?.id, pageSize: 6 }),
		seo: (item) => ({
			description: item.excerpt,
			body: item.body,
			authorName: item.author?.name,
			publishedAt: item.publishedAt ?? item.createdAt,
			type: 'article'
		}),
		ld: (item, url) => [
			articleLd({
				title: item.title,
				description: item.excerpt || item.body,
				url,
				datePublished: item.publishedAt ?? item.createdAt,
				dateModified: item.updatedAt,
				authorName: item.author?.name
			})
		]
	});
