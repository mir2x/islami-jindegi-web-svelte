import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const t = getT(params.locale, 'SettingsPage');
	return {
		msgs: loadMessages(params.locale, 'SettingsPage'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/settings', noindex: true })
	};
};
