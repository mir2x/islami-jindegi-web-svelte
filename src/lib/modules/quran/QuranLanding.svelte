<script lang="ts">
	import AlignJustify from '@lucide/svelte/icons/align-justify';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import History from '@lucide/svelte/icons/history';
	import Search from '@lucide/svelte/icons/search';
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { quranLastRead } from '#lib/storage/last-read.svelte.ts';
	import type { MushafEdition, QuranSurah } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import BookmarksModal from './BookmarksModal.svelte';
	import EditionGrid from './EditionGrid.svelte';
	import SearchModal from './SearchModal.svelte';
	import SurahGrid from './SurahGrid.svelte';

	type Mode = 'mushaf' | 'text' | 'tilawat';
	const MODES: Mode[] = ['mushaf', 'text', 'tilawat'];

	let { editions, surahs }: { editions: MushafEdition[]; surahs: QuranSurah[] } = $props();
	const t = useT('QuranLanding');
	const n = useNum();
	const locale = $derived(currentLocale());

	// The active tab lives in the URL so Back restores it when returning from a reader.
	const initialMode = (): Mode => {
		const m = page.url.searchParams.get('mode') as Mode | null;
		return m && MODES.includes(m) ? m : 'mushaf';
	};
	let mode = $state<Mode>(initialMode());
	let searchOpen = $state(false);
	let bookmarksOpen = $state(false);
	const lastRead = $derived(quranLastRead.current);

	function setMode(next: Mode) {
		mode = next;
		const params = new URLSearchParams(window.location.search);
		if (next === 'mushaf') params.delete('mode');
		else params.set('mode', next);
		const qs = params.toString();
		window.history.replaceState(window.history.state, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
	}

	const CARDS: { mode: Mode; icon: Component<{ class?: string }>; label: string; sub: string; needsSurahs: boolean }[] = $derived([
		{ mode: 'mushaf', icon: BookOpen, label: t('modeMushaf'), sub: t('modeMushafSub'), needsSurahs: false },
		{ mode: 'text', icon: AlignLeft, label: t('modeText'), sub: t('modeTextSub'), needsSurahs: true },
		{ mode: 'tilawat', icon: AlignJustify, label: t('modeTilawat'), sub: t('modeTilawatSub'), needsSurahs: true }
	]);
	const action =
		'w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-lg text-muted-foreground hover:text-primary transition-all';
</script>

<div class="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-10">
	{#if searchOpen}<SearchModal onclose={() => (searchOpen = false)} />{/if}
	{#if bookmarksOpen}<BookmarksModal onclose={() => (bookmarksOpen = false)} />{/if}

	<div class="flex flex-col md:flex-row gap-6 lg:gap-10">
		<div class="w-full md:w-64 shrink-0 flex flex-col gap-3">
			{#each CARDS as card (card.mode)}
				{@const Icon = card.icon}
				{@const active = mode === card.mode}
				<button
					type="button"
					onclick={() => setMode(card.mode)}
					disabled={card.needsSurahs && surahs.length === 0}
					class={cn(
						'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed',
						active ? 'border-primary bg-primary/8 shadow-sm' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
					)}
				>
					<div
						class={cn(
							'w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors',
							active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
						)}
					>
						<Icon class="w-5 h-5" />
					</div>
					<div>
						<p class={cn('font-bold text-lg', active ? 'text-foreground' : 'text-muted-foreground')}>{card.label}</p>
						<p class="text-base text-muted-foreground mt-0.5">{card.sub}</p>
					</div>
				</button>
			{/each}

			<div class="flex flex-col gap-3 mt-4">
				<div class="flex flex-col gap-2">
					<button type="button" onclick={() => (bookmarksOpen = true)} class={action}><BookMarked class="w-4 h-4" />{t('bookmarks')}</button>
					<button type="button" onclick={() => (searchOpen = true)} class={action}><Search class="w-4 h-4" />{t('searchQuran')}</button>
				</div>
				{#if lastRead}
					<a
						href={localePath(`/quran/surah/${lastRead.surahNumber}?ayah=${lastRead.ayahNumber}`, locale)}
						class="flex items-center gap-3 w-full p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
					>
						<div class="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0"><History class="w-5 h-5" /></div>
						<div class="flex-1 min-w-0">
							<p class="text-base text-muted-foreground">{t('continueReading')}</p>
							<p class="text-lg font-semibold text-foreground truncate">{t('surahAyah', { surahName: lastRead.surahName, ayahNumber: n(lastRead.ayahNumber) })}</p>
						</div>
						<ArrowRight class="w-4 h-4 text-primary shrink-0" />
					</a>
				{/if}
			</div>
		</div>

		<div class="flex-1 min-w-0">
			{#if mode === 'mushaf'}<EditionGrid {editions} />
			{:else}<SurahGrid {surahs} hrefPrefix={mode === 'text' ? '/quran/surah' : '/quran/tilawat'} />{/if}
		</div>
	</div>
</div>
