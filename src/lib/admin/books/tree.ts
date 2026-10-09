import type { Chapter, SubChapter } from '#lib/types.ts';

export type TreeSub = SubChapter;

/** parent subchapter id → its direct children, across every chapter of a book. */
export function childMapOf(chapters: Chapter[]): Map<string, TreeSub[]> {
	const map = new Map<string, TreeSub[]>();
	for (const chapter of chapters) {
		for (const s of chapter.subChapters) {
			if (s.parentSubChapterId) map.set(s.parentSubChapterId, [...(map.get(s.parentSubChapterId) ?? []), s]);
		}
	}
	return map;
}
