<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Menu from '@lucide/svelte/icons/menu';
	import Play from '@lucide/svelte/icons/play';
	import ZoomIn from '@lucide/svelte/icons/zoom-in';
	import ZoomOut from '@lucide/svelte/icons/zoom-out';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { SURA_NAMES } from './data.ts';

	interface Props {
		title: string;
		sura: number | undefined;
		visible: boolean;
		drawerOpen: boolean;
		scale: number;
		spread: boolean;
		ontoggleDrawer: () => void;
		onlisten: () => void;
		onzoom: (direction: 1 | -1) => void;
		onspread: () => void;
	}
	let { title, sura, visible, drawerOpen, scale, spread, ontoggleDrawer, onlisten, onzoom, onspread }: Props = $props();

	const t = useT('MushafReader');
	const n = useNum();
	const locale = $derived(currentLocale());
	const btn = 'flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors';
</script>

<div
	class={cn(
		'absolute top-0 inset-x-0 z-40 flex items-center gap-3 px-3 py-2.5 bg-background border-b border-border transition-all duration-300',
		visible ? 'opacity-100' : 'opacity-0 pointer-events-none -translate-y-2'
	)}
>
	<a href={localePath('/quran', locale)} aria-label={t('back')} class="{btn} shrink-0"><ArrowLeft class="w-5 h-5" /></a>
	<button type="button" onclick={ontoggleDrawer} class="flex-1 min-w-0 flex items-center gap-1 text-left max-sm:pointer-events-none lg:pointer-events-none">
		<div class="min-w-0">
			<p class="text-foreground font-semibold text-sm truncate"><span class="sm:hidden">{title.split(/\s+/).slice(0, 2).join(' ')}</span><span class="hidden sm:inline">{title}</span></p>
			{#if sura}<p class="text-muted-foreground text-xs truncate">{SURA_NAMES[sura - 1]}</p>{/if}
		</div>
		<ChevronDown class={cn('w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 max-sm:hidden lg:hidden', drawerOpen && 'rotate-180')} />
	</button>
	<!-- An icon button like its neighbours on phones; the labelled accent pill from `sm` up. -->
	<button
		type="button"
		onclick={onlisten}
		aria-label={t('listenTilawat')}
		title={t('listenTilawat')}
		class="max-sm:hidden shrink-0 inline-flex items-center justify-center gap-1.5 w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 sm:rounded-full sm:bg-primary sm:text-primary-foreground sm:hover:bg-primary sm:hover:text-primary-foreground sm:hover:opacity-90 sm:text-xs sm:font-semibold"
		><Play class="w-5 h-5 sm:w-3.5 sm:h-3.5" /><span class="hidden sm:inline">{t('listenTilawat')}</span></button
	>
	<div class="contents">
		<button type="button" onclick={() => onzoom(-1)} disabled={scale <= 0.75} aria-label={t('zoomOut')} class={btn}><ZoomOut class="w-4.5 h-4.5" /></button>
		<span class="text-muted-foreground text-xs w-9 text-center tabular-nums">{n(Math.round(scale * 100))}%</span>
		<button type="button" onclick={() => onzoom(1)} disabled={scale >= 3} aria-label={t('zoomIn')} class={btn}><ZoomIn class="w-4.5 h-4.5" /></button>
	</div>
	<button
		type="button"
		onclick={onspread}
		title={spread ? t('singlePageView') : t('twoPageView')}
		aria-label={spread ? t('singlePageView') : t('twoPageView')}
		class={cn(
			'max-sm:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
			spread ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
		)}><BookOpen class="w-4.5 h-4.5" /></button
	>
	<!-- Phones: opens the surah / para / bookmark list. -->
	<button type="button" onclick={ontoggleDrawer} aria-label="Menu" class="{btn} sm:hidden shrink-0"><Menu class="w-5 h-5" /></button>
</div>
