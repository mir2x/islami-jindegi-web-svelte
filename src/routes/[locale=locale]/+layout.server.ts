import { buildSeo } from '#lib/seo.ts';
import { CHROME_NAMESPACES, getT, loadMessages } from '#lib/server/i18n.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ params }) => {
	const locale = params.locale;
	const t = getT(locale, 'Metadata');
	return {
		chrome: loadMessages(locale, ...CHROME_NAMESPACES),
		// Default head metadata; pages return their own `seo` to replace it.
		seo: buildSeo({ locale, title: t('title'), description: t('description'), path: '/', absoluteTitle: true })
	};
};
