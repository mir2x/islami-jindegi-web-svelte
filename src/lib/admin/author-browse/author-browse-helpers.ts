import { AUTHOR_MODULES } from '#lib/modules.ts';
import type { AuthorBrowseAdminItem } from '#lib/types.ts';

/** Select value for "no group"; the API uses null. */
export const UNGROUPED = '__ungrouped__';
export const ALL = '__all__';

export const countsLine = (author: AuthorBrowseAdminItem) =>
	AUTHOR_MODULES.filter((m) => (author.counts[m.key] ?? 0) > 0)
		.map((m) => `${author.counts[m.key]} ${m.label}`)
		.join(' · ');

/** Moves one id within a list; returns a new list. */
export function moved(ids: string[], from: number, to: number): string[] {
	const next = [...ids];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}
