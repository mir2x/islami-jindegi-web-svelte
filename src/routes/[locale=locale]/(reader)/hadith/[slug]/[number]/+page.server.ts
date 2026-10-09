import { error, redirect } from '@sveltejs/kit';
import { getHadithLocation } from '#lib/server/quran-api.ts';
import type { PageServerLoad } from './$types';

// Stable share/jump URL: /hadith/{book}/{hadithNumber} resolves to the chapter that holds it.
export const load: PageServerLoad = async ({ params }) => {
	const n = parseInt(params.number);
	if (isNaN(n) || n < 1) error(404, 'Not found');
	const loc = await getHadithLocation(params.slug, n);
	if (!loc) error(404, 'Not found');
	redirect(307, `/${params.locale}/hadith/${loc.bookSlug}/chapter/${loc.chapterId}?hadith=${loc.hadithNumber}`);
};
