import { goto } from '$app/navigation';
import { page } from '$app/state';
import { untrack } from 'svelte';

/**
 * A search box whose value lives in the URL (`?q=`): typing replaces the query after a short pause
 * and the server re-renders the list (so every search result is a real, shareable URL).
 */
export class UrlSearch {
	text = $state('');
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(initial: string) {
		this.text = untrack(() => initial);
	}

	set = (value: string) => {
		this.text = value;
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			const url = new URL(page.url.href);
			if (value) url.searchParams.set('q', value);
			else url.searchParams.delete('q');
			url.searchParams.delete('page');
			void goto(url, { replace: true, reset: false });
		}, 350);
	};
}
