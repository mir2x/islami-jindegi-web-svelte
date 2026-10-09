<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import History from '@lucide/svelte/icons/history';
	import Search from '@lucide/svelte/icons/search';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { DEFAULT_ARABIC_FONT } from '#lib/quran-fonts.ts';
	import { hadithLastRead } from '#lib/storage/last-read.svelte.ts';
	import type { HadithBook } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import BookmarksModal from './BookmarksModal.svelte';
	import { hadithHref } from './common.ts';
	import SearchModal from './SearchModal.svelte';

	let { books }: { books: HadithBook[] } = $props();
	const t = useT('HadithLanding');
	const n = useNum();
	const locale = $derived(currentLocale());
	let searchOpen = $state(false);
	let bookmarksOpen = $state(false);
	const lastRead = $derived(hadithLastRead.current);
	const visible = $derived(books.filter((b) => b.totalChapters > 0));
	const action =
		'w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-lg text-muted-foreground hover:text-primary transition-all';
</script>

<div class="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-10">
	{#if searchOpen}<SearchModal onclose={() => (searchOpen = false)} />{/if}
	{#if bookmarksOpen}<BookmarksModal onclose={() => (bookmarksOpen = false)} />{/if}

	<div class="flex flex-col md:flex-row gap-6 lg:gap-10">
		<div class="w-full md:w-64 shrink-0 flex flex-col gap-3">
			<div class="mb-1">
				<h1 class="text-2xl font-bold text-foreground">{t('title')}</h1>
				<p class="text-base text-muted-foreground mt-1">{t('subtitle')}</p>
			</div>
			<button type="button" onclick={() => (bookmarksOpen = true)} class={action}><BookMarked class="w-4 h-4" />{t('bookmarks')}</button>
			<button type="button" onclick={() => (searchOpen = true)} class={action}><Search class="w-4 h-4" />{t('searchHadith')}</button>

			{#if lastRead}
				<a
					href={localePath(hadithHref(lastRead.bookSlug, lastRead.chapterId, lastRead.hadithNumber), locale)}
					class="flex items-center gap-3 w-full p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
				>
					<div class="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0"><History class="w-5 h-5" /></div>
					<div class="flex-1 min-w-0">
						<p class="text-base text-muted-foreground">{t('continueReading')}</p>
						<p class="text-lg font-semibold text-foreground truncate">{t('bookHadith', { bookTitle: lastRead.bookTitle, number: n(lastRead.hadithNumber) })}</p>
					</div>
					<ArrowRight class="w-4 h-4 text-primary shrink-0" />
				</a>
			{/if}
		</div>

		<div class="flex-1 min-w-0">
			{#if visible.length === 0}
				<p class="text-center text-muted-foreground py-20">{t('noBooks')}</p>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
					{#each visible as book, i (book.id)}
						<a
							href={localePath(`/hadith/${book.slug}`, locale)}
							class="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
						>
							<div
								class="w-11 h-11 shrink-0 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors tabular-nums"
							>
								{n(i + 1)}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between gap-2">
									<p class="text-lg font-semibold text-foreground truncate">{book.title}</p>
									{#if book.titleAr}<p class="text-xl text-muted-foreground shrink-0 truncate max-w-[45%]" style:font-family={DEFAULT_ARABIC_FONT} style:direction="rtl">
											{book.titleAr}
										</p>{/if}
								</div>
								<p class="text-base text-muted-foreground mt-0.5 truncate">
									{t('hadithCount', { count: n(book.totalHadith) })} · {t('chapterCount', { count: n(book.totalChapters) })}
								</p>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
