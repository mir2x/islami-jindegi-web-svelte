<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
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
		'absolute top-0 inset-x-0 z-30 flex items-center gap-3 px-3 py-2.5 bg-background border-b border-border transition-all duration-300',
		visible ? 'opacity-100' : 'opacity-0 pointer-events-none -translate-y-2'
	)}
>
	<a href={localePath('/quran', locale)} aria-label={t('back')} class="{btn} shrink-0"><ArrowLeft class="w-5 h-5" /></a>
	<button type="button" onclick={ontoggleDrawer} class="flex-1 min-w-0 flex items-center gap-1 text-left">
		<div class="min-w-0">
			<p class="text-foreground font-semibold text-sm truncate">{title}</p>
			{#if sura}<p class="text-muted-foreground text-xs truncate">{SURA_NAMES[sura - 1]}</p>{/if}
		</div>
		<ChevronDown class={cn('w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0', drawerOpen && 'rotate-180')} />
	</button>
	<button
		type="button"
		onclick={onlisten}
		class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
		><Play class="w-3.5 h-3.5" />{t('listenTilawat')}</button
	>
	<button type="button" onclick={() => onzoom(-1)} disabled={scale <= 0.75} aria-label={t('zoomOut')} class={btn}><ZoomOut class="w-4.5 h-4.5" /></button>
	<span class="text-muted-foreground text-xs w-9 text-center tabular-nums">{n(Math.round(scale * 100))}%</span>
	<button type="button" onclick={() => onzoom(1)} disabled={scale >= 3} aria-label={t('zoomIn')} class={btn}><ZoomIn class="w-4.5 h-4.5" /></button>
	<button
		type="button"
		onclick={onspread}
		title={spread ? t('singlePageView') : t('twoPageView')}
		aria-label={spread ? t('singlePageView') : t('twoPageView')}
		class={cn(
			'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
			spread ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
		)}><BookOpen class="w-4.5 h-4.5" /></button
	>
</div>
