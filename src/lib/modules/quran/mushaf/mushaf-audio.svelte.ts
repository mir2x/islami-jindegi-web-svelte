import { apiPost } from '#lib/client-api.ts';
import type { SuraAudioUrls } from '#lib/types.ts';
import { AYAH_COUNTS } from './data.ts';

export interface Ayah {
	sura: number;
	ayah: number;
}
export interface MushafRange {
	sura: number;
	start: number;
	end: number;
	repeatsLeft: number;
}

/** Presigned URLs expire after 5 minutes: reuse for 4. */
const URL_TTL_MS = 4 * 60_000;

/** Recitation inside the mushaf reader: plays ayahs across the page view, with range and repeat. */
export class MushafAudio {
	active = $state<Ayah | null>(null);
	range = $state<MushafRange | null>(null);
	playing = $state(false);
	loading = $state(false);
	error = $state(false);

	#audio: HTMLAudioElement | null = null;
	#cache: { key: string; urls: string[]; at: number } | null = null;
	#reciter: () => string;
	/** Called before each ayah plays, so the reader can turn to its page. */
	#follow: (sura: number, ayah: number) => void;

	constructor(reciter: () => string, follow: (sura: number, ayah: number) => void) {
		this.#reciter = reciter;
		this.#follow = follow;
	}

	#element() {
		if (!this.#audio) {
			const a = new Audio();
			a.addEventListener('ended', () => this.#ended());
			a.addEventListener('pause', () => (this.playing = false));
			a.addEventListener('play', () => (this.playing = true));
			this.#audio = a;
		}
		return this.#audio;
	}

	async #urls(sura: number): Promise<string[]> {
		const reciterId = this.#reciter();
		const key = `${reciterId}:${sura}`;
		if (this.#cache?.key === key && Date.now() - this.#cache.at < URL_TTL_MS) return this.#cache.urls;
		const res = await apiPost<SuraAudioUrls>('/api/quran/sura-audio-urls', { reciterId, sura });
		if (!res) throw new Error('no audio urls');
		this.#cache = { key, urls: res.urls, at: Date.now() };
		return res.urls;
	}

	play = async (sura: number, ayah: number) => {
		this.active = { sura, ayah };
		this.error = false;
		this.#follow(sura, ayah);
		this.loading = true;
		try {
			const url = (await this.#urls(sura))[ayah - 1];
			if (!url) throw new Error('audio url missing');
			const audio = this.#element();
			audio.pause();
			audio.src = url;
			await audio.play();
		} catch {
			this.error = true;
			this.playing = false;
		} finally {
			this.loading = false;
		}
	};

	playSingle = (sura: number, ayah: number) => {
		this.range = { sura, start: ayah, end: ayah, repeatsLeft: 1 };
		void this.play(sura, ayah);
	};

	startRange(sura: number, start: number, end: number, repeats: number) {
		this.range = { sura, start, end, repeatsLeft: Math.max(1, repeats) };
		void this.play(sura, start);
	}

	stop = () => {
		this.#audio?.pause();
		this.range = null;
		this.active = null;
	};

	toggle = () => {
		if (!this.#audio || !this.active) return;
		if (this.playing) this.#audio.pause();
		else this.#audio.play().catch(() => (this.error = true));
	};
	back = () => this.active && this.play(this.active.sura, Math.max(1, this.active.ayah - 1));
	forward = () => this.active && this.active.ayah < AYAH_COUNTS[this.active.sura - 1] && this.play(this.active.sura, this.active.ayah + 1);

	#ended() {
		const range = this.range;
		if (!this.active || !range) return;
		const next = this.active.ayah + 1;
		if (next <= range.end) return void this.play(range.sura, next);
		if (range.repeatsLeft > 1) {
			this.range = { ...range, repeatsLeft: range.repeatsLeft - 1 };
			return void this.play(range.sura, range.start);
		}
		this.stop();
	}

	destroy() {
		this.#audio?.pause();
		this.#audio = null;
	}
}
