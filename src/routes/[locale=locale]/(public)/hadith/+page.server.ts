import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getHadithBooks } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const t = getT(params.locale, 'HadithLanding');
	return {
		books: await getHadithBooks(),
		msgs: loadMessages(params.locale, 'HadithLanding', 'HadithBookmarksModal', 'HadithSearchModal', 'HadithJump'),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/hadith' })
	};
};
