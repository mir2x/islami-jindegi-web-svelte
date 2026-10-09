<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { mushafBookmarks, quranBookmarks } from '#lib/storage/bookmarks.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { paraOfSuraAyah, SURA_NAMES } from './data.ts';
	import type { MushafIndex } from './mushaf-index.svelte.ts';

	interface Props {
		index: MushafIndex;
		editionId: string;
		ongoAyah: (sura: number, ayah: number) => void;
		ongoPage: (page: number) => void;
	}
	let { index, editionId, ongoAyah, ongoPage }: Props = $props();
	const t = useT('MushafReader');
	const n = useNum();
	let tab = $state<'ayah' | 'page'>('ayah');
	const pages = $derived(mushafBookmarks.all.filter((b) => b.editionId === editionId));
	const row = 'flex-1 min-w-0 px-3 py-2.5 text-left hover:bg-muted transition-colors disabled:opacity-50';
	const trash = 'shrink-0 p-2.5 text-muted-foreground hover:text-destructive transition-colors';
</script>

<div class="flex flex-col flex-1 overflow-hidden">
	<div class="flex border-b border-border shrink-0">
		{#each [['ayah', t('bookmarkTabAyah')], ['page', t('bookmarkTabPage')]] as const as [id, label] (id)}
			<button
				type="button"
				onclick={() => (tab = id)}
				class={cn('flex-1 py-2.5 text-xs font-semibold transition-colors', tab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}
				>{label}</button
			>
		{/each}
	</div>

	<div class="flex-1 overflow-y-auto">
		{#if tab === 'ayah'}
			{#if quranBookmarks.all.length === 0}<p class="text-center text-sm text-muted-foreground py-16 px-4">{t('noAyahBookmarks')}</p>{/if}
			{#each quranBookmarks.all as b, i (`${b.surahNumber}:${b.ayahNumber}`)}
				{@const pg = index.ayahFirstPage.get(`${b.surahNumber}:${b.ayahNumber}`)}
				<div class="flex items-center border-b border-border/40">
					<button type="button" onclick={() => ongoAyah(b.surahNumber, b.ayahNumber)} disabled={pg === undefined} class={row}>
						<p class="text-sm font-medium text-foreground truncate">{n(i + 1)}. {b.surahName}, {t('ayahLabel', { number: n(b.ayahNumber) })}</p>
						<p class="text-xs text-muted-foreground">
							{t('paraLabel', { number: n(paraOfSuraAyah(b.surahNumber, b.ayahNumber)) })}{pg !== undefined ? `, ${t('pageLabel', { number: n(pg) })}` : ''}
						</p>
					</button>
					<button type="button" onclick={() => quranBookmarks.remove(b)} title={t('remove')} aria-label={t('remove')} class={trash}><Trash2 class="w-4 h-4" /></button>
				</div>
			{/each}
		{:else}
			{#if pages.length === 0}<p class="text-center text-sm text-muted-foreground py-16 px-4">{t('noPageBookmarks')}</p>{/if}
			{#each pages as b, i (b.page)}
				<div class="flex items-center border-b border-border/40">
					<button type="button" onclick={() => ongoPage(b.page)} class={row}>
						<p class="text-sm font-medium text-foreground truncate">{n(i + 1)}. {SURA_NAMES[b.sura - 1] ?? ''}</p>
						<p class="text-xs text-muted-foreground">{b.para ? `${t('paraLabel', { number: n(b.para) })}, ` : ''}{t('pageLabel', { number: n(b.page) })}</p>
					</button>
					<button type="button" onclick={() => mushafBookmarks.remove(b)} title={t('remove')} aria-label={t('remove')} class={trash}><Trash2 class="w-4 h-4" /></button>
				</div>
			{/each}
		{/if}
	</div>
</div>
