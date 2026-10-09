<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { QuranSurah } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { JUZ_STARTS, juzOf } from './juz.ts';
	import { PageMap } from './page-map.svelte.ts';

	type Tab = 'surah' | 'verse' | 'juz' | 'page';
	const TABS: Tab[] = ['surah', 'verse', 'juz', 'page'];
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
	const n = useNum();
	const label: Record<Tab, string> = $derived({ surah: t('navTabSurah'), verse: t('navTabVerse'), juz: t('navTabJuz'), page: t('navTabPage') });
	let tab = $state<Tab>('surah');
	let search = $state('');
	// The "verse" tab browses another surah's ayahs without leaving the current one.
	// svelte-ignore state_referenced_locally
	let browsed = $state(surahNumber);
	let pageInput = $state('');
	let pageError = $state(false);
	const pages = new PageMap();

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
		if (tab === 'page') void pages.load();
	});

	const filtered = $derived.by(() => {
		const q = search.trim();
		if (!q) return allSurahs;
		return allSurahs.filter((s) => s.nameBengali.includes(q) || s.transliteration.toLowerCase().includes(q.toLowerCase()) || String(s.number).includes(q));
	});
	const browsedSurah = $derived(allSurahs.find((s) => s.number === browsed) ?? allSurahs[0]);
	const currentJuz = $derived(juzOf(surahNumber, activeAyah ?? 1));

	function goToPage() {
		pageError = false;
		const target = pages.map?.get(parseInt(pageInput, 10));
		if (!target) return void (pageError = true);
		ongo(target.sura, target.ayah);
	}
	const row = 'flex w-full items-center gap-3 text-left hover:bg-muted transition-colors';
</script>

<div class="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden bg-background">
	<div class="flex items-center border-b border-border shrink-0">
		{#each TABS as id (id)}
			<button
				type="button"
				onclick={() => (tab = id)}
				class={cn('flex-1 py-3 text-base font-semibold transition-colors', tab === id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}
				>{label[id]}</button
			>
		{/each}
	</div>

	<div class="flex-1 overflow-y-auto flex flex-col">
		{#if tab === 'surah'}
			<div class="px-3 pt-3 pb-2 shrink-0">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
					<input
						bind:value={search}
						placeholder={t('searchSurah')}
						class="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>
			<div class="flex-1 overflow-y-auto">
				{#each filtered as s (s.number)}
					<button type="button" onclick={() => ongo(s.number)} class={cn(row, 'px-4 py-2.5', s.number === surahNumber && 'bg-primary/10 text-primary')}>
						<span class="w-8 text-right text-base font-bold text-muted-foreground tabular-nums shrink-0">{n(s.number)}</span>
						<div class="flex-1 min-w-0">
							<p class="text-lg font-semibold truncate">{s.nameBengali}</p>
							<p class="text-base text-muted-foreground">{t('ayahCount', { count: n(s.totalAyahs) })}</p>
						</div>
						<p class="text-xl text-muted-foreground shrink-0" style="font-family: var(--quran-arabic-font); direction: rtl">{s.nameArabic}</p>
					</button>
				{/each}
			</div>
		{:else if tab === 'verse'}
			<div class="flex flex-1 overflow-hidden">
				<div class="flex-1 overflow-y-auto border-r border-border">
					{#each allSurahs as s (s.number)}
						<button type="button" onclick={() => (browsed = s.number)} class={cn(row, 'gap-2 px-3 py-2.5', browsed === s.number && 'bg-muted/60')}>
							<span class="text-base text-muted-foreground tabular-nums w-7 shrink-0">{n(s.number)}</span>
							<span class={cn('text-lg truncate', browsed === s.number ? 'font-bold text-foreground' : 'text-muted-foreground')}>{s.nameBengali}</span>
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
		{:else}
			<div class="px-4 pt-4 space-y-4">
				<p class="text-lg font-medium text-foreground">{t('goToPage')}</p>
				<p class="text-base text-muted-foreground">{t('pageRange', { max: pages.max ? n(pages.max) : '…' })}</p>
				<div class="flex gap-2">
					<input
						type="number"
						min={1}
						max={pages.max ?? undefined}
						bind:value={pageInput}
						onkeydown={(e) => e.key === 'Enter' && goToPage()}
						placeholder={t('pageNumber')}
						disabled={pages.loading}
						class="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
					/>
					<button
						type="button"
						onclick={goToPage}
						disabled={pages.loading || !pageInput}
						class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
					>
						{#if pages.loading}<Loader2 class="w-4 h-4 animate-spin" />{:else}{t('go')}{/if}
					</button>
				</div>
				{#if pageError}<p class="text-base text-destructive">{t('invalidPage')}</p>{/if}
			</div>
		{/if}
	</div>
</div>
