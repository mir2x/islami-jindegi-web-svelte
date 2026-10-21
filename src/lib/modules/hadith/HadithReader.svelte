<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import Settings from '@lucide/svelte/icons/settings';
	import { tick } from 'svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { hadithLastRead } from '#lib/storage/last-read.svelte.ts';
	import type { HadithChapter, HadithChapterDetail } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import BookmarksModal from './BookmarksModal.svelte';
	import { filterChapters, groupByBab } from './common.ts';
	import HadithCard from './HadithCard.svelte';
	import HadithText from './HadithText.svelte';
	import JumpForm from './JumpForm.svelte';
	import { readerPrefs as prefs } from './reader-prefs.svelte.ts';
	import ReaderSettings from './ReaderSettings.svelte';
	import SearchModal from './SearchModal.svelte';

	interface Props {
		detail: HadithChapterDetail;
		chapters: HadithChapter[];
		initialHadith: number | null;
	}
	let { detail, chapters, initialHadith }: Props = $props();

	const t = useT('HadithReader');
	const n = useNum();
	const locale = $derived(currentLocale());
	const { book, chapter, prev, next, hadiths } = $derived(detail);

	let showNav = $state(false);
	let showSettings = $state(false);
	let searchOpen = $state(false);
	let bookmarksOpen = $state(false);
	let chapterSearch = $state('');
	// svelte-ignore state_referenced_locally
	let activeHadith = $state<number | null>(initialHadith);
	let scroller = $state<HTMLElement>();

	const groups = $derived(groupByBab(hadiths));
	const filteredChapters = $derived(filterChapters(chapters, chapterSearch));
	const fontVars = $derived(
		`--hadith-arabic-font: ${prefs.arabicFont.family}; --hadith-bengali-font: ${prefs.bengaliFont.family}; --hadith-arabic-size: ${prefs.arabicSize}px; --hadith-bengali-size: ${prefs.bengaliSize}px`
	);

	// Deep-link to a hadith (search, bookmark, jump, share link).
	$effect(() => {
		const target = initialHadith;
		void chapter.id;
		if (!target) return;
		const timer = setTimeout(() => scroller?.querySelector(`[data-hadith="${target}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
		return () => clearTimeout(timer);
	});

	// Track the hadith being read: the topmost card crossing the upper third of the viewport.
	$effect(() => {
		void chapter.id;
		const root = scroller;
		if (!root) return;
		let observer: IntersectionObserver | undefined;
		tick().then(() => {
			observer = new IntersectionObserver(
				(entries) => {
					const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
					const num = Number((visible[0]?.target as HTMLElement | undefined)?.dataset.hadith);
					if (num) activeHadith = num;
				},
				{ root, rootMargin: '0px 0px -66% 0px' }
			);
			root.querySelectorAll('[data-hadith]').forEach((el) => observer!.observe(el));
		});
		return () => observer?.disconnect();
	});

	// Continue-reading.
	$effect(() => {
		if (activeHadith !== null) hadithLastRead.set({ bookSlug: book.slug, bookTitle: book.title, chapterId: chapter.id, hadithNumber: activeHadith });
	});

	const icon = 'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';
	const arabicTitle = 'font-family: var(--hadith-arabic-font); direction: rtl';
	const chapterLink = 'flex w-full items-center gap-2 p-3.5 text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group';
</script>

<div class="flex flex-col bg-background h-full" style={fontVars}>
	{#if searchOpen}<SearchModal book={{ slug: book.slug, title: book.title }} onclose={() => (searchOpen = false)} />{/if}
	{#if bookmarksOpen}<BookmarksModal onclose={() => (bookmarksOpen = false)} />{/if}

	<div class="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-background z-10">
		<a href={localePath(`/hadith/${book.slug}`, locale)} title={t('back')} aria-label={t('back')} class={icon}><ArrowLeft class="w-5 h-5" /></a>
		<!-- One heading for the page; the two responsive title blocks below are presentational. -->
		<h1 class="sr-only">{book.title} — {chapter.title}</h1>
		<div class="flex-1 min-w-0">
			<p class="text-xs text-primary font-semibold truncate">{book.title}</p>
			<p class="font-bold text-foreground text-base leading-tight truncate">{chapter.title}</p>
		</div>
		<button type="button" onclick={() => (bookmarksOpen = true)} class={icon} title={t('bookmarksList')} aria-label={t('bookmarksList')}><BookMarked class="w-5 h-5" /></button>
		<button type="button" onclick={() => (searchOpen = true)} class={icon} title={t('searchHadith')} aria-label={t('searchHadith')}><Search class="w-5 h-5" /></button>
		<button
			type="button"
			onclick={() => (showSettings = !showSettings)}
			class={cn('p-1.5 rounded-lg transition-colors', showSettings ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
			title={t('settings')}
			aria-label={t('settings')}><Settings class="w-5 h-5" /></button
		>
		<!-- Phones: shows / hides the chapter sidebar. -->
		<button
			type="button"
			onclick={() => (showNav = !showNav)}
			aria-label="Menu"
			aria-pressed={showNav}
			class={cn('sm:hidden p-1.5 rounded-lg transition-colors', showNav ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}><Menu class="w-5 h-5" /></button
		>
	</div>

	{#if showSettings}<ReaderSettings />{/if}

	<div class="relative flex flex-1 min-h-0 overflow-hidden">
		<!-- Phones: tap outside the sidebar to close it. -->
		{#if showNav}<button type="button" tabindex="-1" aria-label="Close" onclick={() => (showNav = false)} class="sm:hidden absolute inset-0 z-40 bg-black/50 cursor-default"></button>{/if}
		<div
			class={cn(
				'w-72 max-w-[85vw] sm:w-80 shrink-0 border-r border-border flex-col min-h-0 overflow-hidden bg-background max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-50 max-sm:shadow-2xl',
				showNav ? 'flex' : 'hidden sm:flex'
			)}
		>
			<div class="px-3 pt-3 pb-2 shrink-0 space-y-2 border-b border-border">
				<JumpForm bookSlug={book.slug} />
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
					<input
						bind:value={chapterSearch}
						placeholder={t('searchChapter')}
						class="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>
			<div class="flex-1 min-h-0 overflow-y-auto">
				{#each filteredChapters as c (c.id)}
					<a
						href={localePath(`/hadith/${book.slug}/chapter/${c.id}`, locale)}
						class={cn('flex w-full items-start px-4 py-2.5 text-left hover:bg-muted transition-colors', c.id === chapter.id && 'bg-primary/10 text-primary')}
						><span class="flex-1 min-w-0 text-lg line-clamp-2">{c.title}</span></a
					>
				{/each}
				{#if filteredChapters.length === 0}<p class="text-center text-muted-foreground py-10">{t('noChapterFound')}</p>{/if}
			</div>
		</div>

		<div bind:this={scroller} class="flex-1 min-h-0 overflow-y-auto">
			<div class="text-center px-4 py-8 border-b border-border/50">
				{#if chapter.titleAr}<p class="text-3xl text-foreground mb-2" style="{arabicTitle}; line-height: 1.6">{chapter.titleAr}</p>{/if}
				<p class="text-xl font-semibold text-foreground">{chapter.title}</p>
				<p class="text-sm text-muted-foreground mt-1">{t('chapterMeta', { number: n(chapter.chapterNumber), count: n(hadiths.length) })}</p>
			</div>

			<div class="max-w-6xl mx-auto w-full px-4 py-6">
				{#if hadiths.length === 0}<p class="text-center text-muted-foreground py-16">{t('empty')}</p>{/if}
				{#each groups as group, gi (`${gi}-${group.items[0].id}`)}
					<section>
						{#if group.title.trim()}
							<div class="pt-6 pb-2 border-b-2 border-primary/20">
								<HadithText text={group.title} class="text-lg font-bold text-primary leading-snug" />
								{#if prefs.showArabic && group.titleAr}<p
										class="text-right text-muted-foreground mt-1 leading-loose"
										style="{arabicTitle}; font-size: calc(var(--hadith-arabic-size) * 0.8)"
									>
										{group.titleAr}
									</p>{/if}
							</div>
						{/if}
						{#each group.items as h (h.id)}
							<HadithCard hadith={h} bookSlug={book.slug} bookTitle={book.title} chapterId={chapter.id} showArabic={prefs.showArabic} isActive={initialHadith === h.hadithNumber} />
						{/each}
					</section>
				{/each}
			</div>

			<div class="max-w-6xl mx-auto w-full px-4 pb-8 grid grid-cols-2 gap-3">
				{#if prev}
					<a href={localePath(`/hadith/${book.slug}/chapter/${prev.id}`, locale)} class={chapterLink}>
						<ChevronLeft class="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary" />
						<div class="min-w-0">
							<p class="text-xs text-muted-foreground">{t('prevChapter')}</p>
							<p class="text-sm font-semibold truncate group-hover:text-primary">{prev.title}</p>
						</div>
					</a>
				{:else}<div></div>{/if}
				{#if next}
					<a href={localePath(`/hadith/${book.slug}/chapter/${next.id}`, locale)} class="{chapterLink} justify-end">
						<div class="min-w-0 text-right">
							<p class="text-xs text-muted-foreground">{t('nextChapter')}</p>
							<p class="text-sm font-semibold truncate group-hover:text-primary">{next.title}</p>
						</div>
						<ChevronRight class="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary" />
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>
