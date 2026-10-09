import type { AyahBox } from '#lib/types.ts';

// The Madani edition is the closest to the standard 1–606 print-page numbering used for page jumps.
const PAGE_JUMP_EDITION = 'madani';

export type PageTarget = { sura: number; ayah: number };

/** page → first (surah, ayah) on it, built lazily from the Madani mushaf's ayah boxes. */
export class PageMap {
	map = $state<Map<number, PageTarget> | null>(null);
	loading = $state(false);

	get max() {
		return this.map && this.map.size > 0 ? Math.max(...this.map.keys()) : null;
	}

	async load() {
		if (this.map || this.loading) return;
		this.loading = true;
		try {
			const boxes: AyahBox[] = await (await fetch(`/api/quran/mushaf/${PAGE_JUMP_EDITION}/ayah-boxes`)).json();
			const top = new Map<number, AyahBox>();
			for (const b of boxes) {
				const best = top.get(b.page_number);
				if (!best || b.min_y < best.min_y) top.set(b.page_number, b);
			}
			this.map = new Map([...top].map(([page, b]) => [page, { sura: b.sura_number, ayah: b.ayah_number }]));
		} catch {
			this.map = new Map();
		}
		this.loading = false;
	}
}
