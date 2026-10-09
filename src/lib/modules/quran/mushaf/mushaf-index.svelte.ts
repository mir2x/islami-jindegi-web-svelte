import type { AyahBox } from '#lib/types.ts';
import { PARA_STARTS } from './data.ts';

/** Page/surah/para lookups derived from a mushaf edition's ayah boxes (mirrors the mobile app's logic). */
export class MushafIndex {
	boxes = $state<AyahBox[]>([]);
	loading = $state(true);
	#totalPages: number;

	constructor(totalPages: number) {
		this.#totalPages = totalPages;
	}

	async load(editionId: string) {
		this.loading = true;
		try {
			// Same-origin proxy: the CDN has no CORS headers.
			this.boxes = await (await fetch(`/api/quran/mushaf/${editionId}/ayah-boxes`)).json();
		} catch (e) {
			console.error('Failed to load ayah boxes:', e);
		}
		this.loading = false;
	}

	byPage = $derived.by(() => {
		const map = new Map<number, AyahBox[]>();
		for (const box of this.boxes) {
			const list = map.get(box.page_number);
			if (list) list.push(box);
			else map.set(box.page_number, [box]);
		}
		return map;
	});

	suraFirstPage = $derived.by(() => {
		const map = new Map<number, number>();
		for (const box of this.boxes) {
			const cur = map.get(box.sura_number);
			if (cur === undefined || box.page_number < cur) map.set(box.sura_number, box.page_number);
		}
		return map;
	});

	ayahFirstPage = $derived.by(() => {
		const map = new Map<string, number>();
		for (const box of this.boxes) {
			const key = `${box.sura_number}:${box.ayah_number}`;
			const cur = map.get(key);
			if (cur === undefined || box.page_number < cur) map.set(key, box.page_number);
		}
		// Known off-by-one corrections in older Hafizi ayah_boxes data (same as the app); only triggers
		// on the exact bad values, so other editions are unaffected.
		if (map.get('9:93') === 203) map.set('9:93', 204);
		if (map.get('15:1') === 263) map.set('15:1', 264);
		return map;
	});

	/** para → the physical pages it spans. */
	paraPages = $derived.by(() => {
		const first = new Map<number, number>();
		PARA_STARTS.forEach(([s, a], i) => {
			const p = this.ayahFirstPage.get(`${s}:${a}`);
			if (p !== undefined) first.set(i + 1, p);
		});
		const ranges = new Map<number, number[]>();
		for (let i = 1; i <= 30; i++) {
			const start = first.get(i);
			const nextStart = first.get(i + 1);
			const end = i < 30 ? (nextStart !== undefined ? nextStart - 1 : undefined) : this.#totalPages;
			if (start !== undefined && end !== undefined && start <= end)
				ranges.set(
					i,
					Array.from({ length: end - start + 1 }, (_, k) => start + k)
				);
		}
		return ranges;
	});

	paraOf(page: number): number | null {
		for (const [para, pages] of this.paraPages) if (pages.includes(page)) return para;
		return null;
	}
}
