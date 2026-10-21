<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { QuranSurah } from '#lib/types.ts';
	import { DEFAULT_ARABIC_FONT } from '#lib/quran-fonts.ts';
	import { quranBookmarks } from '#lib/storage/bookmarks.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { JUZ_STARTS, juzOf } from './juz.ts';

	type Tab = 'verse' | 'juz' | 'bookmark';
	const TABS: Tab[] = ['verse', 'juz', 'bookmark'];
	const TAB_KEY = 'quran_nav_tab';

	interface Props {
		allSurahs: QuranSurah[];
		surahNumber: number;
		activeAyah: number | null;
		/** Open a surah (optionally at an ayah): navigates, or scrolls when it is the current surah. */
		ongo: (surah: number, ayah?: number) => void;
	}
	let { allSurahs, surahNumber, activeAyah, ongo }: Props = $props();

	const t = useT('SurahReader');
	const tb = useT('BookmarksModal');
	const n = useNum();
	const label: Record<Tab, string> = $derived({ verse: t('navTabVerse'), juz: t('navTabJuz'), bookmark: t('navTabBookmark') });
	let tab = $state<Tab>('verse');
	// The "verse" tab browses another surah's ayahs without leaving the current one.
	// svelte-ignore state_referenced_locally
	let browsed = $state(surahNumber);

	$effect(() => {
		try {
			const saved = sessionStorage.getItem(TAB_KEY) as Tab | null;
			if (saved && TABS.includes(saved)) tab = saved;
		} catch {
			/* storage unavailable */
		}
	});
	$effect(() => {
		try {
			sessionStorage.setItem(TAB_KEY, tab);
		} catch {
			/* ignore */
		}
	});

	const browsedSurah = $derived(allSurahs.find((s) => s.number === browsed) ?? allSurahs[0]);
	const currentJuz = $derived(juzOf(surahNumber, activeAyah ?? 1));

	const row = 'flex w-full items-center gap-3 text-left hover:bg-muted transition-colors';
</script>

<div class="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden bg-background max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-50 max-sm:shadow-2xl">
	<div class="flex items-center border-b border-border shrink-0">
		{#each TABS as id (id)}
			<button
				type="button"
				onclick={() => (tab = id)}
				class={cn('flex-1 min-w-0 px-1 py-3 text-sm font-semibold whitespace-nowrap transition-colors', tab === id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}
				>{label[id]}</button
			>
		{/each}
	</div>

	<div class="flex-1 overflow-y-auto flex flex-col">
		{#if tab === 'verse'}
			<div class="flex flex-1 overflow-hidden">
				<div class="flex-1 overflow-y-auto border-r border-border">
					{#each allSurahs as s (s.number)}
						<button type="button" onclick={() => (browsed = s.number)} class={cn(row, 'gap-2 px-3 py-2.5', browsed === s.number && 'bg-primary/10')}>
							<span class={cn('text-base tabular-nums w-7 shrink-0', browsed === s.number ? 'text-primary font-semibold' : 'text-muted-foreground')}>{n(s.number)}</span>
							<span class={cn('text-lg truncate', browsed === s.number ? 'font-semibold text-primary' : 'text-muted-foreground')}>{s.nameBengali}</span>
						</button>
					{/each}
				</div>
				<div class="w-14 overflow-y-auto shrink-0">
					{#each Array.from({ length: browsedSurah.totalAyahs }, (_, i) => i + 1) as a (a)}
						<button
							type="button"
							onclick={() => ongo(browsedSurah.number, a)}
							class={cn(
								'w-full py-2.5 text-lg text-center transition-colors hover:bg-muted',
								browsedSurah.number === surahNumber && activeAyah === a ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'
							)}>{n(a)}</button
						>
					{/each}
				</div>
			</div>
		{:else if tab === 'juz'}
			<div class="flex-1 overflow-y-auto">
				{#each JUZ_STARTS as start, i (i)}
					{@const juz = i + 1}
					{@const startSurah = allSurahs.find((s) => s.number === start.surah)}
					{#if startSurah}
						<button type="button" onclick={() => ongo(start.surah, start.ayah)} class={cn(row, 'px-4 py-3 border-b border-border/50', currentJuz === juz && 'bg-primary/10')}>
							<div
								class={cn(
									'w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0',
									currentJuz === juz ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
								)}
							>
								{n(juz)}
							</div>
							<div class="flex-1 min-w-0">
								<p class={cn('text-lg font-semibold', currentJuz === juz && 'text-primary')}>{t('para', { number: n(juz) })}</p>
								<p class="text-base text-muted-foreground truncate">{t('surahAyah', { surahName: startSurah.nameBengali, ayahNumber: n(start.ayah) })}</p>
							</div>
							<ChevronRight class="w-4 h-4 text-muted-foreground shrink-0" />
						</button>
					{/if}
				{/each}
			</div>
		{:else if tab === 'bookmark'}
			<div class="flex-1 overflow-y-auto">
				{#each [...quranBookmarks.all].reverse() as b (`${b.surahNumber}-${b.ayahNumber}`)}
					<div class="flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
						<button type="button" onclick={() => ongo(b.surahNumber, b.ayahNumber)} class="flex-1 min-w-0 text-left">
							<div class="flex items-center gap-2 mb-1">
								<span class="text-xs font-semibold text-primary">{b.surahName}</span><span class="text-xs text-muted-foreground">{tb('ayah', { number: n(b.ayahNumber) })}</span>
							</div>
							<p class="text-lg text-right text-foreground line-clamp-1" style:font-family={DEFAULT_ARABIC_FONT} style:direction="rtl">{b.arabic}</p>
						</button>
						<button type="button" onclick={() => quranBookmarks.remove(b)} title={tb('remove')} aria-label={tb('remove')} class="shrink-0 mt-1 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
							><Trash2 class="w-3.5 h-3.5" /></button
						>
					</div>
				{:else}
					<p class="text-center text-sm text-muted-foreground py-16 px-4">{tb('empty')}</p>
				{/each}
			</div>
		{/if}
	</div>
</div>
