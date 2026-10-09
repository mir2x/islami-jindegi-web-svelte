import { audioObjectLd } from '#lib/json-ld.ts';
import { loadDetail } from '#lib/server/detail-page.ts';
import { getT } from '#lib/server/i18n.ts';
import { getBayan, getBayans } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) =>
	loadDetail({
		locale: params.locale,
		id: params.id,
		section: 'bayan',
		namespaces: ['BayanDetail'],
		get: getBayan,
		related: (item) => getBayans({ authorId: item.author.id, pageSize: 6 }),
		seo: (item) => ({
			description: item.excerpt ?? getT(params.locale, 'BayanDetail')('metaDescription', { title: item.title, name: item.author.name }),
			authorName: item.author.name,
			publishedAt: item.publishedAt,
			type: 'article'
		}),
		ld: (item, url) => [audioObjectLd({ title: item.title, description: item.excerpt, url, audioUrl: item.audioUrl, authorName: item.author.name })]
	});
