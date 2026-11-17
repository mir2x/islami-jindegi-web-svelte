/** The block after (or before) [current] among the playable block numbers, skipping blocks without audio. The app uses the same rule. */
export function neighbourBlock(playable: number[], current: number | null, next: boolean): number | null {
	const sorted = [...playable].sort((a, b) => a - b);
	if (!sorted.length) return null;
	if (current == null) return next ? sorted[0] : sorted[sorted.length - 1];
	for (const n of next ? sorted : sorted.reverse()) if (next ? n > current : n < current) return n;
	return null;
}

export const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

/** Plays the recitation of one Arabic block of a dua at a time, like the app's ArabicAudioController. */
export class ArabicPlayer {
	/** Audio url by block number, only for blocks whose recording matches the current text. */
	urls = $state(new Map<number, string>());
	/** The block being played or paused; null when stopped. */
	current = $state<number | null>(null);
	playing = $state(false);
	repeat = $state(false);
	failed = $state(false);
	speed = $state(1);
	/** Bumped when a block without audio is tapped, so the page can say so. */
	unavailableAt = $state(0);

	#audio: HTMLAudioElement | null = null;

	#el(): HTMLAudioElement {
		if (this.#audio) return this.#audio;
		const a = new Audio();
		a.preload = 'auto';
		a.onplay = () => (this.playing = true);
		a.onpause = () => (this.playing = false);
		a.onended = () => {
			if (this.repeat) {
				a.currentTime = 0;
				a.play().catch(() => {});
			} else this.playing = false;
		};
		a.onerror = () => {
			if (this.current == null) return;
			this.failed = true;
			this.playing = false;
		};
		this.#audio = a;
		return a;
	}

	has = (n: number) => this.urls.has(n);

	/** Starts block [n], or pauses/resumes it when it is already the current one. */
	toggle = (n: number) => {
		if (!this.has(n)) {
			this.unavailableAt = Date.now();
			return;
		}
		if (this.current === n) {
			const a = this.#el();
			if (a.paused) a.play().catch(() => (this.failed = true));
			else a.pause();
			return;
		}
		this.#start(n);
	};

	toggleCurrent = () => {
		if (this.current != null) this.toggle(this.current);
	};
	next = () => this.#step(true);
	previous = () => this.#step(false);
	toggleRepeat = () => (this.repeat = !this.repeat);

	cycleSpeed = () => {
		this.speed = SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length];
		if (this.#audio) this.#audio.playbackRate = this.speed;
	};

	stop = () => {
		this.current = null;
		this.playing = false;
		this.failed = false;
		this.#audio?.pause();
	};

	destroy = () => {
		this.stop();
		if (this.#audio) this.#audio.src = '';
		this.#audio = null;
	};

	#step(next: boolean) {
		const target = neighbourBlock([...this.urls.keys()], this.current, next);
		if (target != null) this.#start(target);
	}

	#start(n: number) {
		const url = this.urls.get(n);
		if (!url) return;
		// One recitation at a time on the page: pause any other player (the dua's full audio).
		for (const other of document.querySelectorAll('audio')) other.pause();
		const a = this.#el();
		this.current = n;
		this.failed = false;
		this.playing = true;
		a.src = url;
		a.playbackRate = this.speed;
		a.play().catch(() => {
			if (this.current !== n) return;
			this.failed = true;
			this.playing = false;
		});
	}
}
