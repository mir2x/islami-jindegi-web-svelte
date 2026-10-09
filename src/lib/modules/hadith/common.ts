import type { HadithChapter, HadithItem } from '#lib/types.ts';

export function filterChapters(chapters: HadithChapter[], search: string) {
	const q = search.trim().toLowerCase();
	if (!q) return chapters;
	return chapters.filter((c) => c.title.toLowerCase().includes(q) || (c.titleAr ?? '').includes(q) || String(c.chapterNumber) === q);
}

// Imported text is usually plain, but some records carry markup (footnotes always do).
export const hasMarkup = (text: string) => /<\/?[a-z][^>]*>/i.test(text);
export const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').trim();

/** Consecutive hadith under the same bab (Title) share one heading. */
export function groupByBab(hadiths: HadithItem[]) {
	const groups: { title: string; titleAr: string | null; items: HadithItem[] }[] = [];
	for (const h of hadiths) {
		const last = groups[groups.length - 1];
		if (last && last.title === h.title) last.items.push(h);
		else groups.push({ title: h.title, titleAr: h.titleAr, items: [h] });
	}
	return groups;
}

/** Bangla keyboards type Bengali digits into the number box. */
export const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));

export const GRADE_STYLES: { match: RegExp; className: string }[] = [
	{ match: /sahih|authentic|সহীহ|ছহীহ/i, className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
	{ match: /hasan|good|হাসান/i, className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30' },
	{ match: /fabricat|mawd|মাওযু|জাল/i, className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30' },
	{ match: /da.?if|weak|যঈফ|যয়ীফ|দুর্বল/i, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' }
];

/** Link to a hadith inside its chapter. */
export const hadithHref = (bookSlug: string, chapterId: number, hadithNumber: number) => `/hadith/${bookSlug}/chapter/${chapterId}?hadith=${hadithNumber}`;
