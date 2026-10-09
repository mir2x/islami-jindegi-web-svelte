<script lang="ts">
	import type { Component } from 'svelte';
	import type { BookDetail } from '#lib/types.ts';
	import ChapterReader from './ChapterReader.svelte';

	interface Props {
		book: BookDetail;
		hasChapters: boolean;
		hasPdf: boolean;
	}
	let { book, hasChapters, hasPdf }: Props = $props();

	// svelte-ignore state_referenced_locally
	let mode = $state<'text' | 'pdf'>(hasChapters ? 'text' : 'pdf');

	// pdf.js is large and only needed once someone opens the PDF view: load it on demand.
	let Pdf = $state<Component<{ book: BookDetail; pdfUrl: string; onSwitchToText?: () => void }>>();
	$effect(() => {
		if (mode === 'pdf' && !Pdf) void import('./pdf/PdfReader.svelte').then((m) => (Pdf = m.default));
	});
</script>

{#if mode === 'text' && hasChapters}
	<ChapterReader {book} onSwitchToPdf={hasPdf ? () => (mode = 'pdf') : undefined} />
{:else if Pdf}
	<Pdf {book} pdfUrl={book.documentUrl!} onSwitchToText={hasChapters ? () => (mode = 'text') : undefined} />
{/if}
