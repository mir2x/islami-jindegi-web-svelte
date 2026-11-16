import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const t = getT(params.locale, 'MosquesPage');
	return {
		msgs: loadMessages(params.locale, 'MosquesPage', 'Location'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/mosques' })
	};
};
