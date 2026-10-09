import { error } from '@sveltejs/kit';
import { bn } from '#lib/bengali-numerals.ts';
import { breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getHadithBook, getHadithChapter } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const { locale, slug } = params;
	const id = parseInt(params.chapterId);
	if (isNaN(id)) error(404, 'Not found');

	const [detail, book] = await Promise.all([getHadithChapter(slug, id), getHadithBook(slug)]);
	if (!detail || !book) error(404, 'Not found');

	const hadith = parseInt(url.searchParams.get('hadith') ?? '');
	const t = getT(locale, 'HadithReader');
	const path = `/hadith/${slug}/chapter/${id}`;
	const count = locale === 'bn' ? bn(detail.hadiths.length) : detail.hadiths.length;
	return {
		detail,
		chapters: book.chapters,
		initialHadith: isNaN(hadith) ? null : hadith,
		msgs: loadMessages(locale, 'HadithReader', 'HadithSearchModal', 'HadithBookmarksModal', 'HadithJump'),
		seo: buildSeo({
			locale,
			title: t('metaTitle', { chapter: detail.chapter.title, book: detail.book.title }),
			description: t('metaDescription', { chapter: detail.chapter.title, book: detail.book.title, count }),
			path,
			jsonLd: [
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: getT(locale, 'Nav')('hadith'), path: '/hadith' },
					{ name: book.title, path: `/hadith/${slug}` },
					{ name: detail.chapter.title, path }
				])
			]
		})
	};
};
