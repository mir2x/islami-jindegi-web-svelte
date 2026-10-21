<script lang="ts">
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import DrawerBookmarksTab from './DrawerBookmarksTab.svelte';
	import DrawerJuzTab from './DrawerJuzTab.svelte';
	import DrawerSurahTab from './DrawerSurahTab.svelte';
	import type { MushafIndex } from './mushaf-index.svelte.ts';

	type Tab = 'surah' | 'juz' | 'bookmarks';
	interface Props {
		open: boolean;
		title: string;
		index: MushafIndex;
		editionId: string;
		navSurah: number;
		navPara: number;
		currentAyah: { sura: number; ayah: number } | null;
		visiblePages: number[];
		onsurah: (sura: number) => void;
		onpara: (para: number) => void;
		ongoAyah: (sura: number, ayah: number) => void;
		ongoPage: (page: number) => void;
	}
	let { open, title, index, editionId, navSurah, navPara, currentAyah, visiblePages, onsurah, onpara, ongoAyah, ongoPage }: Props = $props();

	const t = useT('MushafReader');
	let tab = $state<Tab>('surah');
	const tabs = $derived<{ id: Tab; label: string }[]>([
		{ id: 'surah', label: t('drawerTabSurah') },
		{ id: 'juz', label: t('drawerTabJuz') },
		{ id: 'bookmarks', label: t('drawerTabBookmarks') }
	]);
</script>

<!-- Navigation panel: a slide-in drawer over the reader, below the top bar, on phones, a docked always-shown column from `lg`. -->
<div
	class={cn(
		'absolute left-0 top-[60px] bottom-14 sm:bottom-0 z-50 w-80 max-w-[85vw] flex flex-col bg-background border-r border-border shadow-2xl',
		'lg:relative lg:top-0 lg:bottom-0 lg:mt-[60px] lg:h-[calc(100%-60px)] lg:z-auto lg:max-w-none lg:shrink-0 lg:shadow-none',
		'transition-transform duration-300',
		open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
	)}
>
	<div class="lg:hidden flex items-center justify-between gap-2 px-4 h-12 border-b border-border shrink-0">
		<span class="text-sm font-semibold text-foreground truncate">{title}</span>
	</div>
	<div class="flex items-center border-b border-border shrink-0">
		{#each tabs as item (item.id)}
			<button
				type="button"
				onclick={() => (tab = item.id)}
				class={cn(
					'flex-1 py-3 text-xs font-semibold transition-colors',
					tab === item.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
				)}>{item.label}</button
			>
		{/each}
	</div>

	{#if index.loading}
		<div class="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
			<div class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
			<p class="text-sm">{t('loadingAyahData')}</p>
		</div>
	{:else}
		<div class="flex-1 flex flex-col overflow-hidden">
			{#if tab === 'surah'}<DrawerSurahTab {index} {navSurah} {currentAyah} {onsurah} onayah={ongoAyah} />
			{:else if tab === 'juz'}<DrawerJuzTab {index} {navPara} {visiblePages} {onpara} ongoto={ongoPage} />
			{:else}<DrawerBookmarksTab {index} {editionId} {ongoAyah} {ongoPage} />{/if}
		</div>
	{/if}
</div>
