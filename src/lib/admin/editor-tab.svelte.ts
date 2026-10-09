import { replaceState } from '$app/navigation';
import { page } from '$app/state';

const DEFAULT_TAB = 'general';

/** The tab set by `set()`; `null` means "read it from the URL" (after any real navigation). */
let override = $state<string | null>(null);

/**
 * An editor's active tab lives in `?tab=`, so it survives a refresh and the side list can carry it to
 * the next item. `replaceState` does not update `page.url`, so the choice is also kept here until the next
 * real navigation. Pass the editor's tabs to ignore unknown values; a side list that only forwards the tab can omit them.
 */
export function editorTab(tabs?: readonly string[]) {
	// A real navigation (another item, another screen) starts from the URL again.
	$effect(() => {
		void page.route.id;
		void page.params;
		override = null;
	});

	return {
		get current(): string {
			const p = override ?? page.url.searchParams.get('tab') ?? '';
			return p && (!tabs || tabs.includes(p)) ? p : DEFAULT_TAB;
		},
		set(next: string) {
			override = next;
			const url = new URL(page.url.href);
			if (next === DEFAULT_TAB) url.searchParams.delete('tab');
			else url.searchParams.set('tab', next);
			replaceState(url, page.state);
		}
	};
}

/** Appends the current tab to an editor link so switching item keeps the tab. */
export const withEditorTab = (href: string, tab: string) => (tab === DEFAULT_TAB ? href : `${href}?tab=${encodeURIComponent(tab)}`);
