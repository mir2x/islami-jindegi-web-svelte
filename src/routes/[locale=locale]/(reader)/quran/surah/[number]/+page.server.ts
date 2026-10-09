import { error } from '@sveltejs/kit';
import { bn } from '#lib/bengali-numerals.ts';
import { breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getQuranReciters, getQuranSurah, getQuranSurahs, getQuranTranslators } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const { locale } = params;
	const n = parseInt(params.number);
	if (isNaN(n) || n < 1 || n > 114) error(404, 'Not found');

	const [surahs, surah, reciters, translators] = await Promise.all([getQuranSurahs(), getQuranSurah(n), getQuranReciters(), getQuranTranslators()]);
	if (!surah) error(404, 'Not found');
	const meta = surahs.find((s) => s.number === n);

	const ayah = parseInt(url.searchParams.get('ayah') ?? '');
	const t = getT(locale, 'SurahReader');
	const path = `/quran/surah/${n}`;
	return {
		surah,
		allSurahs: surahs,
		reciters,
		translators,
		initialAyah: isNaN(ayah) ? null : ayah,
		msgs: loadMessages(locale, 'SurahReader', 'QuranSearchModal', 'BookmarksModal', 'TafsirModal'),
		seo: buildSeo({
			locale,
			title: t('metaTitle', { name: surah.nameBengali }),
			description: t('metaDescription', {
				name: surah.nameBengali,
				nameEnglish: surah.nameEnglish,
				revelation: t(surah.revelationType === 'Meccan' ? 'meccan' : 'medinan'),
				totalAyahs: locale === 'bn' ? bn(surah.totalAyahs) : surah.totalAyahs
			}),
			path,
			type: 'article',
			keywords: [surah.nameBengali, surah.nameEnglish, surah.nameArabic, 'কুরআন', 'সূরা', 'Quran', 'Surah'],
			jsonLd: [
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: getT(locale, 'Nav')('quran'), path: '/quran' },
					{ name: locale === 'bn' ? (meta?.nameBengali ?? surah.nameBengali) : (meta?.nameEnglish ?? surah.nameEnglish), path }
				])
			]
		})
	};
};
