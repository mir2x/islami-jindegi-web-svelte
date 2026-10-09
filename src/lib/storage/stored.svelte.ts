import { createSubscriber } from 'svelte/reactivity';

/** Every StoredValue in this tab listens here; other tabs arrive through the `storage` event. */
const listeners = new Set<() => void>();
const notifyAll = () => listeners.forEach((l) => l());

/**
 * A JSON value kept in localStorage, readable reactively from components.
 *
 * `current` is `fallback` on the server and during hydration, so server and client markup match, then
 * switches to the stored value. Writes update every component in this tab and, through the `storage`
 * event, the other tabs.
 */
export class StoredValue<T> {
	#key: string;
	#fallback: T;
	#raw: string | null = null;
	#parsed: T;
	#subscribe: () => void;
	/** Store the value as a bare string instead of JSON (the old site's font keys are bare strings). */
	#bare: boolean;

	constructor(key: string, fallback: T, options: { bare?: boolean } = {}) {
		this.#bare = options.bare ?? false;
		this.#key = key;
		this.#fallback = fallback;
		this.#parsed = fallback;
		this.#subscribe = createSubscriber((update) => {
			listeners.add(update);
			const onStorage = (e: StorageEvent) => (e.key === key || e.key === null) && update();
			window.addEventListener('storage', onStorage);
			return () => {
				listeners.delete(update);
				window.removeEventListener('storage', onStorage);
			};
		});
	}

	get current(): T {
		if (typeof window === 'undefined') return this.#fallback;
		this.#subscribe();
		return this.read();
	}

	/** Non-reactive read (event handlers, one-off checks). */
	read(): T {
		if (typeof window === 'undefined') return this.#fallback;
		let raw: string | null = null;
		try {
			raw = localStorage.getItem(this.#key);
		} catch {
			/* storage blocked */
		}
		if (raw !== this.#raw) {
			this.#raw = raw;
			try {
				this.#parsed = raw === null ? this.#fallback : this.#bare ? (raw as T) : (JSON.parse(raw) as T);
			} catch {
				this.#parsed = this.#fallback;
			}
		}
		return this.#parsed;
	}

	set(value: T) {
		try {
			localStorage.setItem(this.#key, this.#bare ? String(value) : JSON.stringify(value));
		} catch {
			/* storage full or blocked: keep working in memory only */
		}
		notifyAll();
	}
}
