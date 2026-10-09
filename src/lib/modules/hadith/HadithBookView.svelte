<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Search from '@lucide/svelte/icons/search';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { DEFAULT_ARABIC_FONT } from '#lib/quran-fonts.ts';
	import type { HadithBookDetail } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { filterChapters } from './common.ts';
	import JumpForm from './JumpForm.svelte';
	import SearchModal from './SearchModal.svelte';

	let { book }: { book: HadithBookDetail } = $props();
	const t = useT('HadithBook');
	const n = useNum();
	const locale = $derived(currentLocale());
	let search = $state('');
	let searchOpen = $state(false);
	const filtered = $derived(filterChapters(book.chapters, search));
</script>

<div class="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-10">
	{#if searchOpen}<SearchModal book={{ slug: book.slug, title: book.title }} onclose={() => (searchOpen = false)} />{/if}

	<a href={localePath('/hadith', locale)} class="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-primary transition-colors mb-5"
		><ArrowLeft class="w-4 h-4" />{t('back')}</a
	>

	<div class="flex flex-col md:flex-row gap-6 lg:gap-10">
		<div class="w-full md:w-72 shrink-0 flex flex-col gap-4">
			<div>
				<h1 class="text-2xl font-bold text-foreground">{book.title}</h1>
				{#if book.titleAr}<p class="text-2xl text-muted-foreground mt-1" style:font-family={DEFAULT_ARABIC_FONT} style:direction="rtl">{book.titleAr}</p>{/if}
				<p class="text-base text-muted-foreground mt-2">{t('hadithCount', { count: n(book.totalHadith) })} · {t('chapterCount', { count: n(book.chapters.length) })}</p>
			</div>
			<JumpForm bookSlug={book.slug} />
			<button
				type="button"
				onclick={() => (searchOpen = true)}
				class="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-lg text-muted-foreground hover:text-primary transition-all"
				><Search class="w-4 h-4" />{t('searchInBook')}</button
			>
		</div>

		<div class="flex-1 min-w-0">
			<div class="relative mb-6 max-w-sm">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<input
					type="text"
					bind:value={search}
					placeholder={t('searchChapter')}
					class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
			<div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-2">
				{#each filtered as c (c.id)}
					<a
						href={localePath(`/hadith/${book.slug}/chapter/${c.id}`, locale)}
						class="group flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
					>
						<div
							class="min-w-9 h-9 px-1.5 shrink-0 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors tabular-nums"
						>
							{n(c.chapterNumber)}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-lg font-semibold text-foreground line-clamp-2">{c.title}</p>
							<p class="text-base text-muted-foreground mt-0.5">
								{c.rangeStart && c.rangeEnd ? t('range', { start: n(c.rangeStart), end: n(c.rangeEnd) }) : t('hadithCount', { count: n(c.totalHadith) })}
							</p>
						</div>
					</a>
				{/each}
			</div>
			{#if filtered.length === 0}<p class="text-center text-muted-foreground py-16">{t('noChapterFound')}</p>{/if}
		</div>
	</div>
</div>
