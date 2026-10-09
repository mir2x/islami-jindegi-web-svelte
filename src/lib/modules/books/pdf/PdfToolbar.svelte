<script lang="ts">
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Columns from '@lucide/svelte/icons/columns-2';
	import Download from '@lucide/svelte/icons/download';
	import LayoutList from '@lucide/svelte/icons/layout-list';
	import Maximize from '@lucide/svelte/icons/maximize';
	import Minimize from '@lucide/svelte/icons/minimize';
	import Square from '@lucide/svelte/icons/square';
	import ZoomIn from '@lucide/svelte/icons/zoom-in';
	import ZoomOut from '@lucide/svelte/icons/zoom-out';
	import Img from '#lib/components/ui/Img.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BookDetail } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import type { PdfView } from './pdf-view.svelte.ts';

	interface Props {
		book: BookDetail;
		pdfUrl: string;
		view: PdfView;
		fullscreen: boolean;
		onFullscreen: () => void;
		onSwitchToText?: () => void;
	}
	let { book, pdfUrl, view, fullscreen, onFullscreen, onSwitchToText }: Props = $props();

	const t = useT('BookReader');
	const locale = $derived(currentLocale());
	let pageInput = $state('1');
	$effect(() => {
		pageInput = String(view.page);
	});

	const tool = 'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
	const mode = (active: boolean) => cn('p-1.5 transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted');
	const back = 'flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 mr-1';
</script>

{#snippet divider()}<div class="w-px h-5 bg-border mx-1"></div>{/snippet}

<div class="flex items-center gap-2 px-3 sm:px-4 min-h-14 py-2 border-b border-border bg-card shrink-0 flex-wrap gap-y-2">
	{#if onSwitchToText}
		<button type="button" onclick={onSwitchToText} class={back}><AlignLeft class="w-4 h-4" /><span class="hidden sm:inline">{t('textLabel')}</span></button>
	{:else}
		<a href={localePath('/books', locale)} class={back}><ArrowLeft class="w-4 h-4" /><span class="hidden sm:inline">{t('booksLabel')}</span></a>
	{/if}

	<div class="flex items-center gap-2 flex-1 min-w-0">
		<div class="w-7 h-9 relative shrink-0 rounded overflow-hidden shadow-sm">
			<Img src={book.coverUrl || '/images/default-book.png'} alt={book.title} sizes="28px" class="object-cover" />
		</div>
		<div class="min-w-0">
			<p class="text-sm font-semibold text-foreground truncate">{book.title}</p>
			{#if book.authors[0]}<p class="text-xs text-muted-foreground truncate">{book.authors[0].name}</p>{/if}
		</div>
	</div>

	<div class="flex items-center gap-0.5 shrink-0">
		<div class="flex items-center border border-border rounded-lg overflow-hidden">
			<button type="button" class={mode(view.layout === 'single')} title={t('singlePage')} aria-label={t('singlePage')} onclick={() => view.setLayout('single')}
				><Square class="w-3.5 h-3.5" /></button
			>
			<button type="button" class={mode(view.layout === 'double')} title={t('doublePage')} aria-label={t('doublePage')} onclick={() => view.setLayout('double')}
				><Columns class="w-3.5 h-3.5" /></button
			>
		</div>
		<div class="flex items-center border border-border rounded-lg overflow-hidden ml-1">
			<button type="button" class={mode(view.nav === 'continuous')} title={t('continuousScroll')} aria-label={t('continuousScroll')} onclick={() => view.setNav('continuous')}
				><LayoutList class="w-3.5 h-3.5" /></button
			>
			<button type="button" class={mode(view.nav === 'flip')} title={t('flipPage')} aria-label={t('flipPage')} onclick={() => view.setNav('flip')}
				><BookMarked class="w-3.5 h-3.5" /></button
			>
		</div>

		{@render divider()}
		<button type="button" class={tool} onclick={view.zoomOut} disabled={view.zoomIdx === 0} title={t('zoomOut')} aria-label={t('zoomOut')}><ZoomOut class="w-4 h-4" /></button>
		<button
			type="button"
			onclick={view.resetZoom}
			title={t('resetZoom')}
			class="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors min-w-[3rem] text-center tabular-nums"
			>{Math.round(view.scale * 100)}%</button
		>
		<button type="button" class={tool} onclick={view.zoomIn} disabled={view.zoomMax} title={t('zoomIn')} aria-label={t('zoomIn')}><ZoomIn class="w-4 h-4" /></button>

		{@render divider()}
		<button type="button" class={tool} onclick={view.prev} disabled={view.page <= 1} title={t('prevPageArrow')} aria-label={t('prevPageArrow')}
			><ChevronLeft class="w-4 h-4" /></button
		>
		<div class="flex items-center gap-1 text-sm">
			<input
				type="text"
				bind:value={pageInput}
				onblur={() => (pageInput = String(view.commitPage(pageInput)))}
				onkeydown={(e) => e.key === 'Enter' && (pageInput = String(view.commitPage(pageInput)))}
				aria-label={t('pageNumberLabel')}
				class="w-10 text-center rounded-md border border-border bg-muted text-foreground text-xs py-1 focus:outline-none focus:ring-1 focus:ring-ring"
			/>
			<span class="text-muted-foreground text-xs whitespace-nowrap">/ {view.pages || '—'}</span>
		</div>
		<button type="button" class={tool} onclick={view.next} disabled={view.page >= view.pages || view.pages === 0} title={t('nextPageArrow')} aria-label={t('nextPageArrow')}
			><ChevronRight class="w-4 h-4" /></button
		>

		{@render divider()}
		<a href={pdfUrl} download class={tool} title={t('download')} aria-label={t('download')}><Download class="w-4 h-4" /></a>
		<button type="button" class={tool} onclick={onFullscreen} title={fullscreen ? t('normalView') : t('fullscreen')} aria-label={fullscreen ? t('normalView') : t('fullscreen')}>
			{#if fullscreen}<Minimize class="w-4 h-4" />{:else}<Maximize class="w-4 h-4" />{/if}
		</button>
	</div>
</div>
