<script lang="ts">
	import Maximize2 from '@lucide/svelte/icons/maximize-2';
	import Printer from '@lucide/svelte/icons/printer';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import ShareActions from './ShareActions.svelte';
	import ZoomControl from './ZoomControl.svelte';

	interface Props {
		zoom: number;
		/** Locale-less path of the item's dedicated page, e.g. `/dua/abc123`. */
		path: string;
		title: string;
		/** Plain text copied by the Copy button. */
		content: string;
		/** Link to the dedicated page; used by list-page detail panels. */
		showOpenPage?: boolean;
	}
	let { zoom = $bindable(100), path, title, content, showOpenPage = false }: Props = $props();

	const t = useT('DetailToolbar');
	const href = $derived(localePath(path, currentLocale()));
	const iconButton = 'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';
</script>

<!-- Zoom / print / copy / share row shared by list-page detail panels and dedicated detail pages. -->
<div class="flex items-center gap-1 shrink-0 print:hidden">
	<ZoomControl bind:zoom />
	<div class="w-px h-5 bg-border mx-1"></div>
	<button type="button" onclick={() => window.print()} title={t('print')} aria-label={t('print')} class={iconButton}><Printer class="w-4.5 h-4.5" /></button>
	<ShareActions url={`${typeof window !== 'undefined' ? window.location.origin : ''}${href}`} {title} {content} />
	{#if showOpenPage}
		<a {href} title={t('openPage')} aria-label={t('openPage')} class={iconButton}><Maximize2 class="w-4.5 h-4.5" /></a>
	{/if}
</div>
