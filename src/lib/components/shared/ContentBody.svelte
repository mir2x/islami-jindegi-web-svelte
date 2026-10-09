<script lang="ts">
	import CategoryChips from './CategoryChips.svelte';
	import DownloadPdfButton from './DownloadPdfButton.svelte';
	import { buildDownloadFilename } from '#lib/utils.ts';

	interface Props {
		/** CMS HTML. */
		html?: string | null;
		/** Plain text shown when there is no body. */
		fallback?: string | null;
		categories?: { id: string; title: string }[];
		documentUrl?: string | null;
		title?: string;
		authorName?: string | null;
		pdfLabel?: string;
		/** A dedicated detail page: plain prose, no category chips (they sit in the meta row). Default is the side-panel look. */
		page?: boolean;
	}
	let { html, fallback, categories = [], documentUrl, title = '', authorName, pdfLabel = '', page = false }: Props = $props();
</script>

{#if html}
	<div class={page ? 'prose-content' : 'prose-content text-base text-foreground leading-relaxed'}>{@html html}</div>
{:else if fallback}
	<p class={page ? 'text-base text-foreground/80 leading-relaxed' : 'text-base text-muted-foreground'}>{fallback}</p>
{/if}

{#if documentUrl}
	<div class="mt-6 print:hidden">
		<DownloadPdfButton url={documentUrl} label={pdfLabel} filename={authorName ? buildDownloadFilename(title, authorName, documentUrl) : `${title}.pdf`} />
	</div>
{/if}

{#if !page}<CategoryChips {categories} class="mt-6 pt-6 border-t border-border/60" />{/if}
