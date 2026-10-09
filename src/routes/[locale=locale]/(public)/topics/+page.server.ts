import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getTopics } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const t = getT(params.locale, 'TopicsPage');
	return {
		index: (await getTopics()) ?? { groups: [], ungrouped: [] },
		heading: t('heading'),
		subheading: t('subheading'),
		msgs: loadMessages(params.locale, 'TopicsPage'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/topics' })
	};
};
