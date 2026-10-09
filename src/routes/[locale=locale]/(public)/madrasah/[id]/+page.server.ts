import { error } from '@sveltejs/kit';
import { articleLd, breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo, canonicalPath, htmlToPlainText } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getMadrasah } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { locale, id } = params;
	const madrasah = await getMadrasah(id);
	if (!madrasah) error(404, 'Not found');

	const photos = [...madrasah.photos].sort((a, b) => a.position - b.position);
	const infos = [...madrasah.infos].sort((a, b) => a.position - b.position);
	const path = `/madrasah/${id}`;

	return {
		madrasah,
		photos,
		infos,
		msgs: loadMessages(locale, 'MadrasahDetail'),
		seo: buildSeo({
			locale,
			title: madrasah.title,
			description: madrasah.excerpt || htmlToPlainText(madrasah.introduction),
			path,
			image: photos[0]?.imageUrl,
			jsonLd: [
				articleLd({
					title: madrasah.title,
					description: madrasah.excerpt || madrasah.introduction,
					url: canonicalPath(locale, path),
					image: photos[0]?.imageUrl,
					datePublished: madrasah.createdAt,
					dateModified: madrasah.updatedAt
				}),
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: getT(locale, 'Nav')('madrasah'), path: '/madrasah' },
					{ name: madrasah.title, path }
				])
			]
		})
	};
};
