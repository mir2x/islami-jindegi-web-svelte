<script lang="ts">
	import AdminEditButton from '#lib/components/shared/AdminEditButton.svelte';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Download from '@lucide/svelte/icons/download';
	import { onMount } from 'svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BookDetail } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { openPdf, type PDFDocumentProxy } from './pdf-doc.ts';
	import PdfPage from './PdfPage.svelte';
	import PdfToolbar from './PdfToolbar.svelte';
	import { PdfView } from './pdf-view.svelte.ts';

	interface Props {
		book: BookDetail;
		pdfUrl: string;
		onSwitchToText?: () => void;
	}
	let { book, pdfUrl, onSwitchToText }: Props = $props();

	const t = useT('BookReader');
	const view = new PdfView();
	let doc = $state<PDFDocumentProxy>();
	let failed = $state(false);
	let container = $state<HTMLElement>();
	let viewport = $state<HTMLElement>();
	let vpHeight = $state(0);
	let fullscreen = $state(false);
	let slots = $state<HTMLElement[]>([]);

	// Pages fill the viewport height (less the page padding), times the zoom step.
	const fitH = $derived(vpHeight > 0 ? (vpHeight - 48) * view.scale : undefined);
	const estimatedW = $derived(fitH ? fitH * 0.707 : 300);
	const right = $derived(view.left + 1);

	onMount(() => {
		// The PDF goes through our same-origin proxy (the storage host sends no CORS headers).
		const { promise, destroy } = openPdf(`/api/pdf?url=${encodeURIComponent(pdfUrl)}`);
		promise
			.then((d) => {
				doc = d;
				view.pages = d.numPages;
			})
			.catch(() => (failed = true));
		const onFs = () => (fullscreen = !!document.fullscreenElement);
		document.addEventListener('fullscreenchange', onFs);
		return () => {
			document.removeEventListener('fullscreenchange', onFs);
			destroy();
		};
	});

	function onKey(e: KeyboardEvent) {
		if ((e.target as HTMLElement).tagName === 'INPUT') return;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (view.nav !== 'continuous') view.prev();
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			if (view.nav !== 'continuous') view.next();
		} else if (e.key === '+' || e.key === '=') view.zoomIn();
		else if (e.key === '-') view.zoomOut();
	}

	// Continuous mode: track the visible page and keep its neighbours rendered.
	$effect(() => {
		if (view.nav !== 'continuous' || !view.pages) return;
		const observers = slots.slice(0, view.pages).map((el, i) => {
			const io = new IntersectionObserver(
				([entry]) => {
					if (!entry.isIntersecting) return;
					if (entry.intersectionRatio >= 0.3) view.page = i + 1;
					view.reveal(i + 1);
				},
				{ rootMargin: '400px 0px', threshold: [0, 0.3] }
			);
			if (el) io.observe(el);
			return io;
		});
		return () => observers.forEach((o) => o.disconnect());
	});

	function jumpInContinuous(n: number) {
		slots[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
	const toggleFullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : container?.requestFullscreen());
	const zone = 'absolute top-0 h-full w-[15%] flex items-center group disabled:pointer-events-none';
	const bubble = 'opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full p-2';
	const mobileBtn = 'flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-sm font-medium disabled:opacity-40 hover:bg-muted/70 transition-colors';
</script>

<svelte:window onkeydown={onKey} />

<AdminEditButton entity="books" id={book.id} />
<div bind:this={container} class="flex flex-col bg-background overflow-hidden h-full">
	<PdfToolbar {book} {pdfUrl} {view} {fullscreen} onFullscreen={toggleFullscreen} {onSwitchToText} />

	<div
		bind:this={viewport}
		bind:clientHeight={vpHeight}
		class={cn('flex-1 relative bg-muted/20 dark:bg-muted/10', view.nav === 'continuous' ? 'overflow-auto' : 'overflow-hidden flex items-center justify-center')}
	>
		{#if failed}
			<div class="flex flex-col items-center justify-center gap-4 py-24 text-center max-w-sm mx-auto">
				<div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/40"><BookOpen class="w-8 h-8" /></div>
				<div>
					<p class="text-lg font-semibold text-foreground">{t('pdfLoadError')}</p>
					<p class="text-sm text-muted-foreground mt-1">{t('pdfLoadErrorHint')}</p>
				</div>
				<a
					href={pdfUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
					><Download class="w-4 h-4" />{t('downloadDirect')}</a
				>
			</div>
		{:else if !doc}
			<div class="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
				<div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<p class="text-sm">{t('pdfLoading')}</p>
			</div>
		{:else if fitH !== undefined}
			<div class={view.nav === 'continuous' ? 'flex flex-col items-center gap-4 py-6 px-4 w-full' : 'flex flex-col items-center py-6 px-4'}>
				{#if view.nav === 'flip'}
					{#if view.layout === 'single'}
						<PdfPage {doc} pageNumber={view.page} height={fitH} class="shadow-xl rounded-lg overflow-hidden" />
					{:else}
						<div class="flex items-start gap-2 sm:gap-4">
							<PdfPage {doc} pageNumber={view.left} height={fitH} class="shadow-xl rounded-r overflow-hidden" />
							{#if right <= view.pages}<PdfPage {doc} pageNumber={right} height={fitH} class="shadow-xl rounded-l overflow-hidden" />{/if}
						</div>
					{/if}
				{:else}
					{#each Array(view.pages) as _, i (i)}
						<div bind:this={slots[i]} style:min-height="{fitH}px" class="flex items-center justify-center w-full">
							{#if view.rendered.has(i + 1)}
								<PdfPage {doc} pageNumber={i + 1} height={fitH} class="shadow-xl rounded-lg overflow-hidden" />
							{:else}
								<div class="rounded-lg bg-card/40" style:height="{fitH}px" style:width="{estimatedW}px"></div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{/if}

		{#if view.nav === 'flip' && view.pages > 0}
			<button type="button" onclick={view.prev} disabled={view.page <= 1} aria-label={t('prevPageShort')} class="{zone} left-0 justify-start pl-3"
				><div class={bubble}><ChevronLeft class="w-6 h-6 text-white drop-shadow" /></div></button
			>
			<button type="button" onclick={view.next} disabled={view.page >= view.pages} aria-label={t('nextPageShort')} class="{zone} right-0 justify-end pr-3"
				><div class={bubble}><ChevronRight class="w-6 h-6 text-white drop-shadow" /></div></button
			>
		{/if}
	</div>

	{#if view.nav === 'flip'}
		<div class="lg:hidden flex items-center justify-between px-5 py-3 border-t border-border bg-background shrink-0">
			<button type="button" onclick={view.prev} disabled={view.page <= 1} class={mobileBtn}><ChevronLeft class="w-4 h-4" />{t('prevPageShort')}</button>
			<span class="text-sm text-muted-foreground tabular-nums">{view.layout === 'double' ? `${view.left}–${Math.min(right, view.pages)}` : view.page} / {view.pages || '—'}</span>
			<button type="button" onclick={view.next} disabled={view.page >= view.pages || view.pages === 0} class={mobileBtn}
				>{t('nextPageShort')}<ChevronRight class="w-4 h-4" /></button
			>
		</div>
	{/if}
</div>
