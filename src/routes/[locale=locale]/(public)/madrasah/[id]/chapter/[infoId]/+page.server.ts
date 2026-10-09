import { error } from '@sveltejs/kit';
import { articleLd, breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo, canonicalPath } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getMadrasah } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { locale, id, infoId } = params;
	const madrasah = await getMadrasah(id);
	if (!madrasah) error(404, 'Not found');
	const index = madrasah.infos.findIndex((i) => i.id === infoId);
	if (index === -1) error(404, 'Not found');

	const info = madrasah.infos[index];
	const title = `${info.label} — ${madrasah.title}`;
	const path = `/madrasah/${id}/chapter/${infoId}`;
	const tNav = getT(locale, 'Nav');

	return {
		madrasahId: id,
		madrasahTitle: madrasah.title,
		info,
		chapters: madrasah.infos.map((c) => ({ id: c.id, label: c.label })),
		prev: index > 0 ? { id: madrasah.infos[index - 1].id, label: madrasah.infos[index - 1].label } : null,
		next: index < madrasah.infos.length - 1 ? { id: madrasah.infos[index + 1].id, label: madrasah.infos[index + 1].label } : null,
		msgs: loadMessages(locale, 'MadrasahChapter'),
		seo: buildSeo({
			locale,
			title,
			description: madrasah.excerpt ?? '',
			path,
			jsonLd: [
				articleLd({ title, description: madrasah.excerpt || info.info, url: canonicalPath(locale, path), datePublished: madrasah.createdAt, dateModified: madrasah.updatedAt }),
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: tNav('madrasah'), path: '/madrasah' },
					{ name: madrasah.title, path: `/madrasah/${id}` },
					{ name: info.label, path }
				])
			]
		})
	};
};
