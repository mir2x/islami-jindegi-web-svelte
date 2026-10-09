import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getNamazTimes } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const t = getT(params.locale, 'NamazTimesPage');
	return {
		namazTimes: await getNamazTimes(),
		heading: t('metaTitle'),
		msgs: loadMessages(params.locale, 'NamazTimesPage', 'NamazTimesDetail', 'Home'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/namaz-times' })
	};
};
