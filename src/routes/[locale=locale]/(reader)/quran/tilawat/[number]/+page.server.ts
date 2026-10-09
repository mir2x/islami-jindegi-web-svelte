import { error } from '@sveltejs/kit';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getQuranSurah, getQuranSurahs } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { locale } = params;
	const n = parseInt(params.number);
	if (isNaN(n) || n < 1 || n > 114) error(404, 'Not found');

	const [surahs, surah] = await Promise.all([getQuranSurahs(), getQuranSurah(n)]);
	if (!surah) error(404, 'Not found');

	const t = getT(locale, 'TilawatReader');
	return {
		surah,
		allSurahs: surahs,
		msgs: loadMessages(locale, 'TilawatReader', 'TafsirModal'),
		seo: buildSeo({
			locale,
			title: t('metaTitle', { name: surah.nameBengali }),
			description: t('metaDescription', { name: surah.nameBengali, nameEnglish: surah.nameEnglish, totalAyahs: surah.totalAyahs }),
			path: `/quran/tilawat/${n}`,
			type: 'website'
		})
	};
};
