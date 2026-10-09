import { afterNavigate, goto } from '$app/navigation';
import { localePath } from '#lib/i18n/use-t.svelte.ts';

/**
 * Matches normal link behaviour for table rows: Ctrl-click (Windows/Linux) or Cmd-click (macOS)
 * opens the destination in a new tab, a plain click navigates in place.
 */
export function adminNavigate(href: string, event?: { ctrlKey: boolean; metaKey: boolean }) {
	const url = localePath(href);
	if (event?.ctrlKey || event?.metaKey) window.open(url, '_blank', 'noopener,noreferrer');
	else void goto(url);
}

let navigated = false;

/** Call once from the shell: remembers that the dashboard has history of its own to go back to. */
export const trackNavigation = () =>
	afterNavigate(({ type }) => {
		// 'enter' is the first load (for a client-only page too); anything after it is the dashboard's own history.
		if (type !== 'enter') navigated = true;
	});

/** Browser-back, except in a tab opened straight on an editor, where there is nothing behind it: go to `fallback`. */
export function goBack(fallback: string) {
	if (navigated) history.back();
	else void goto(localePath(fallback));
}
