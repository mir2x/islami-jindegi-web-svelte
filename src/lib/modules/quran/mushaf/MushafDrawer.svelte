<script lang="ts">
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { TOP_BAR_SAFE } from './data.ts';
	import DrawerBookmarksTab from './DrawerBookmarksTab.svelte';
	import DrawerJuzTab from './DrawerJuzTab.svelte';
	import DrawerSurahTab from './DrawerSurahTab.svelte';
	import type { MushafIndex } from './mushaf-index.svelte.ts';

	type Tab = 'surah' | 'juz' | 'bookmarks';
	interface Props {
		open: boolean;
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
	let { open, index, editionId, navSurah, navPara, currentAyah, visiblePages, onsurah, onpara, ongoAyah, ongoPage }: Props = $props();

	const t = useT('MushafReader');
	let tab = $state<Tab>('surah');
	const tabs = $derived<{ id: Tab; label: string }[]>([
		{ id: 'surah', label: t('drawerTabSurah') },
		{ id: 'juz', label: t('drawerTabJuz') },
		{ id: 'bookmarks', label: t('drawerTabBookmarks') }
	]);
</script>

<!-- Navigation drawer (left, like the text reader): sits below the top bar, never covers it. -->
<div
	class={cn(
		'absolute bottom-0 left-0 z-50 w-80 max-w-[85vw] flex flex-col bg-background border-r border-border shadow-2xl transition-transform duration-300',
		open ? 'translate-x-0' : '-translate-x-full'
	)}
	style:top="{TOP_BAR_SAFE}px"
	inert={!open}
>
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
