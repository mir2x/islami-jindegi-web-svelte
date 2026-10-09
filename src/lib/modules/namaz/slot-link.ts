import type { PrayerSlot } from '#lib/prayer-times.ts';
import type { NamazTimeListItem } from '#lib/types.ts';

const norm = (v: string | null | undefined) => v?.trim().toLowerCase() ?? '';

/**
 * Maps a prayer slot to its CMS entry (the masail/fazail page), or null when none matches.
 * The slug is the stable key; `title` and `titleBn` are indexed too for an API build without slugs,
 * since at least one row (tahajjud) carries a Bengali-only title.
 */
export function createSlotLinker(namazTimes: NamazTimeListItem[]) {
	const byKey: Record<string, NamazTimeListItem> = {};
	for (const n of namazTimes) {
		for (const key of [norm(n.slug), norm(n.title), norm(n.titleBn)]) if (key && !byKey[key]) byKey[key] = n;
	}

	return (slot: PrayerSlot): string | null => {
		const keys = [slot.key, slot.titleKey, ...(slot.aliases ?? []), slot.nameBn].map(norm).filter(Boolean);
		for (const key of keys) if (byKey[key]) return byKey[key].id;
		const partial = namazTimes.find((n) => [norm(n.title), norm(n.titleBn)].filter(Boolean).some((title) => keys.some((k) => title.includes(k) || k.includes(title))));
		return partial?.id ?? null;
	};
}
