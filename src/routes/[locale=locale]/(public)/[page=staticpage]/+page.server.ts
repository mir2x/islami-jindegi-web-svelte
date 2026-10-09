import { STATIC_PAGE_CONFIG } from '#lib/static-pages.ts';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getPageBySlug } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

/** Renders a CMS page by slug. Headings and metadata follow the locale; the body is the authored Bangla HTML. */
export const load: PageServerLoad = async ({ params }) => {
	const { slug, ns } = STATIC_PAGE_CONFIG[params.page];
	const [page, t] = [await getPageBySlug(slug), getT(params.locale, ns)];
	return {
		body: page?.body ?? null,
		heading: t('heading'),
		unavailable: t('unavailable'),
		msgs: loadMessages(params.locale, ns),
		seo: buildSeo({ locale: params.locale, title: t('metaTitle'), description: t('metaDescription'), path: `/${params.page}` })
	};
};
