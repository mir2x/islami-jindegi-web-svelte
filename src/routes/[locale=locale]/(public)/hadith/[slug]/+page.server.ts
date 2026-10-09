import { error } from '@sveltejs/kit';
import { bn } from '#lib/bengali-numerals.ts';
import { breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getHadithBook } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { locale, slug } = params;
	const book = await getHadithBook(slug);
	if (!book) error(404, 'Not found');

	const t = getT(locale, 'HadithBook');
	const path = `/hadith/${slug}`;
	return {
		book,
		msgs: loadMessages(locale, 'HadithBook', 'HadithSearchModal', 'HadithJump'),
		seo: buildSeo({
			locale,
			title: t('metaTitle', { title: book.title }),
			description: t('metaDescription', { title: book.title, count: locale === 'bn' ? bn(book.totalHadith) : book.totalHadith }),
			path,
			jsonLd: [
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: getT(locale, 'Nav')('hadith'), path: '/hadith' },
					{ name: book.title, path }
				])
			]
		})
	};
};
