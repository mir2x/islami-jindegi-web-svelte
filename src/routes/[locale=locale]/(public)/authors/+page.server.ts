import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getAuthorBrowseIndex } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const t = getT(params.locale, 'AuthorsPage');
	return {
		index: (await getAuthorBrowseIndex()) ?? { groups: [], ungrouped: [] },
		heading: t('heading'),
		subheading: t('subheading'),
		msgs: loadMessages(params.locale, 'AuthorsPage'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/authors' })
	};
};
