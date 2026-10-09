import { qaPageLd } from '#lib/json-ld.ts';
import { loadDetail } from '#lib/server/detail-page.ts';
import { getMasail, getMasails } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) =>
	loadDetail({
		locale: params.locale,
		id: params.id,
		section: 'masail',
		namespaces: ['MasailDetail', 'MasailPage'],
		get: getMasail,
		related: (item) => getMasails({ authorId: item.author?.id ?? undefined, pageSize: 6 }),
		seo: (item) => ({
			description: item.question,
			body: item.answer,
			authorName: item.author?.name,
			publishedAt: item.publishedAt ?? item.createdAt,
			type: 'article'
		}),
		ld: (item, url) => [
			qaPageLd({ title: item.title, question: item.question, answer: item.answer, url, authorName: item.author?.name, datePublished: item.publishedAt ?? item.createdAt })
		]
	});
