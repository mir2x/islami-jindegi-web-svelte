import { error } from '@sveltejs/kit';
import { buildSeo } from '#lib/seo.ts';
import { loadMessages } from '#lib/server/i18n.ts';
import { getNamazTimeDetail } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const item = await getNamazTimeDetail(params.id);
	if (!item) error(404, 'Not found');
	return {
		item,
		msgs: loadMessages(params.locale, 'NamazTimesDetail'),
		seo: buildSeo({ locale: params.locale, title: item.titleBn ?? item.title, description: '', path: `/namaz-times/${params.id}` })
	};
};
