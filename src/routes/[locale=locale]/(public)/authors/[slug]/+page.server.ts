import { error, redirect } from '@sveltejs/kit';
import { AUTHOR_BROWSE_MODULES, authorHref, authorModules, authorPreviewEntries, isAuthorModuleKey } from '#lib/authors.ts';
import { breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo } from '#lib/seo.ts';
import { getAuthorModulePage } from '#lib/server/author-pages.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getAuthorBrowse } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const load: PageServerLoad = async ({ params, url }) => {
	const { locale, slug } = params;
	const author = await getAuthorBrowse(slug);
	if (!author) error(404, 'Not found');

	// Links by author id (e.g. from a content page) settle on the readable slug URL.
	if (GUID.test(slug) && author.slug) redirect(307, `/${locale}${authorHref(author)}${url.search}`);

	const type = url.searchParams.get('type') ?? undefined;
	const modules = authorModules(author.counts);
	// One module: nothing to switch between, so show its list directly.
	const active = (isAuthorModuleKey(type) && modules.find((m) => m.key === type)) || (modules.length === 1 ? modules[0] : null);
	const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
	const list = active ? await getAuthorModulePage(active.key, author.id, page) : null;

	const t = getT(locale, 'AuthorsPage');
	const path = `/authors/${slug}`;
	return {
		author: { id: author.id, slug: author.slug, name: author.name, description: author.description, info: author.info, total: author.total, counts: author.counts },
		modules,
		activeKey: active?.key ?? null,
		previews: Object.fromEntries(AUTHOR_BROWSE_MODULES.map((m) => [m.key, authorPreviewEntries(author, m.key)])),
		list,
		page,
		msgs: loadMessages(locale, 'AuthorsPage'),
		seo: buildSeo({
			locale,
			title: author.name,
			description: author.description ?? t('metaDescription'),
			path,
			type: 'website',
			jsonLd: [
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: getT(locale, 'Nav')('authors'), path: '/authors' },
					{ name: author.name, path }
				])
			]
		})
	};
};
