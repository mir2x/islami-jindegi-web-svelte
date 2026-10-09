import { apiPost } from '#lib/client-api.ts';
import type { SuraAudioUrls } from '#lib/types.ts';

export interface PlayRange {
	start: number;
	end: number;
	repeatsLeft: number;
}

/**
 * Ayah-by-ayah recitation of one surah: loads the (presigned, short-lived) audio URLs, plays single
 * ayahs or a repeating range, and tracks the highlighted ayah.
 */
export class SurahAudio {
	/** The highlighted ayah: the one playing, or the one a deep link / jump pointed at. */
	activeAyah = $state<number | null>(null);
	visible = $state(false);
	playing = $state(false);
	error = $state(false);
	range = $state<PlayRange | null>(null);
	urls = $state<string[]>([]);
	loading = $state(false);

	#audio: HTMLAudioElement | null = null;
	#loadedKey = '';
	#total = 0;
	#reciter = '';
	#surah = 0;
	#onScroll: (ayah: number) => void;

	constructor(onScroll: (ayah: number) => void) {
		this.#onScroll = onScroll;
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

	/** Fetches the URLs for a reciter + surah (no-op when already loaded) and remembers the surah's length. */
	async load(reciterId: string, surah: number, totalAyahs: number) {
		this.#total = totalAyahs;
		this.#reciter = reciterId;
		this.#surah = surah;
		const key = `${reciterId}:${surah}`;
		if (!reciterId || key === this.#loadedKey) return;
		this.#loadedKey = key;
		await this.#fetchUrls(key);
	}

	async #fetchUrls(key: string) {
		this.loading = true;
		const res = await apiPost<SuraAudioUrls>('/api/quran/sura-audio-urls', { reciterId: this.#reciter, sura: this.#surah });
		if (key === `${this.#reciter}:${this.#surah}`) this.urls = res?.urls ?? [];
		this.loading = false;
	}

	/** URLs may have expired: refresh them for the next attempt. */
	#refresh = () => this.#fetchUrls(`${this.#reciter}:${this.#surah}`);

	/** Back to idle: another surah was opened. */
	reset() {
		this.#audio?.pause();
		this.#loadedKey = '';
		this.urls = [];
		this.activeAyah = null;
		this.visible = false;
		this.playing = false;
		this.error = false;
		this.range = null;
	}

	play = (ayah: number) => {
		this.activeAyah = ayah;
		this.visible = true;
		this.error = false;
		this.#onScroll(ayah);
		const url = this.urls[ayah - 1];
		if (!url) {
			this.error = true;
			this.playing = false;
			void this.#refresh();
			return;
		}
		const audio = this.#element();
		audio.pause();
		audio.src = url;
		audio.play().catch(() => {
			this.error = true;
			void this.#refresh();
		});
		this.playing = true;
	};

	playSingle = (ayah: number) => {
		this.range = { start: ayah, end: ayah, repeatsLeft: 1 };
		this.play(ayah);
	};

	startRange(start: number, end: number, repeats: number) {
		this.range = { start, end, repeatsLeft: Math.max(1, repeats) };
		this.play(start);
	}
	stopRange = () => (this.range = null);

	stop = () => {
		this.#audio?.pause();
		this.playing = false;
		this.range = null;
		this.activeAyah = null;
		this.visible = false;
	};

	toggle = () => {
		if (!this.#audio || this.activeAyah === null) return this.play(this.activeAyah ?? 1);
		if (this.playing) return void this.#audio.pause();
		this.#audio.play().catch(() => (this.error = true));
		this.playing = true;
	};
	skipBack = () => this.play(this.activeAyah && this.activeAyah > 1 ? this.activeAyah - 1 : 1);
	skipForward = () => this.activeAyah && this.activeAyah < this.#total && this.play(this.activeAyah + 1);

	#ended() {
		const current = this.activeAyah;
		if (current === null) return;
		const range = this.range;
		if (range) {
			if (current + 1 <= range.end) return this.play(current + 1);
			if (range.repeatsLeft > 1) {
				this.range = { ...range, repeatsLeft: range.repeatsLeft - 1 };
				return this.play(range.start);
			}
			return this.stop();
		}
		if (current + 1 <= this.#total) this.play(current + 1);
		else this.stop();
	}

	destroy() {
		this.#audio?.pause();
		this.#audio = null;
	}
}
