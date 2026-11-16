import { STATIC_PAGE_CONFIG } from '#lib/static-pages.ts';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getPageBySlug } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

/** The CMS page (the admin's instructions for asking) with the question form under it. */
export const load: PageServerLoad = async ({ params }) => {
	const { slug, ns } = STATIC_PAGE_CONFIG['ask-masail'];
	const [page, t] = [await getPageBySlug(slug), getT(params.locale, ns)];
	return {
		body: page?.body ?? null,
		heading: t('heading'),
		msgs: loadMessages(params.locale, ns),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: '/ask-masail' })
	};
};
