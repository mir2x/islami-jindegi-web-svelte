<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { htmlToText } from '#lib/html.ts';
	import { currentLocale, localePath } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import DetailToolbar from './DetailToolbar.svelte';

	interface Props {
		/** Locale-less path of this page, e.g. `/dua/abc123`. */
		path: string;
		title: string;
		/** HTML (or plain text) of the content the Copy button should copy. */
		shareHtml: string;
		backHref: string;
		backLabel: string;
		/** Right-hand column, outside the zoomed area, hidden when printing. */
		sidebar?: Snippet;
		/** Below the content, outside the zoomed area, hidden when printing. */
		footer?: Snippet;
		class?: string;
		children: Snippet;
	}
	let { path, title, shareHtml, backHref, backLabel, sidebar, footer, class: className, children }: Props = $props();

	let zoom = $state(100);
	// Plain text for the Copy button is only needed on click, so it is built lazily.
	const content = () => [title, htmlToText(shareHtml)].filter(Boolean).join('\n\n');
</script>

<!-- A dedicated detail page: back link + zoom/print/copy/share toolbar on top, zoomable content below. -->
<div class={cn('max-w-4xl mx-auto px-4 py-8', className)}>
	<div class="flex items-center justify-between gap-4 mb-6 print:hidden">
		<a href={localePath(backHref, currentLocale())} class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
			<ArrowLeft class="w-4 h-4" />{backLabel}
		</a>
		<DetailToolbar bind:zoom {path} {title} content={shareHtml ? content() : title} />
	</div>

	<div class={cn(sidebar && 'grid grid-cols-1 lg:grid-cols-3 gap-8')}>
		<div class={cn('min-w-0', sidebar && 'lg:col-span-2')} style:zoom="{zoom}%">{@render children()}</div>
		{#if sidebar}<div class="print:hidden">{@render sidebar()}</div>{/if}
	</div>

	{#if footer}<div class="print:hidden">{@render footer()}</div>{/if}
</div>
