import type { ListSnapshot } from './list-state.svelte.ts';

interface Handle {
	capture: () => PageSnapshot | null;
	restore: (snapshot: PageSnapshot) => void;
}
type PageSnapshot = ListSnapshot<{ id: string }> & { scrollTop: number; windowY: number };

let active: Handle | null = null;

/** Scrolls back to a remembered position once the restored list has been laid out (two frames, so the DOM has grown to fit). */
export function restoreScroll(scroller: HTMLElement | undefined, s: { scrollTop: number; windowY: number }) {
	requestAnimationFrame(() =>
		requestAnimationFrame(() => {
			scroller?.scrollTo({ top: s.scrollTop });
			window.scrollTo({ top: s.windowY });
		})
	);
}

/** Called by the list browser while mounted, so the page's `snapshot` export can reach it. */
export function registerBrowser(handle: Handle) {
	active = handle;
	return () => {
		if (active === handle) active = null;
	};
}

/**
 * Page-level `snapshot` for list pages: `export const snapshot = browserSnapshot;`. SvelteKit stores
 * it in the history entry, so going back from a detail page restores the accumulated list and scroll
 * position instead of starting again from page 1.
 */
export const browserSnapshot = {
	capture: () => active?.capture() ?? null,
	restore: (snapshot: PageSnapshot | null) => snapshot && active?.restore(snapshot)
};
