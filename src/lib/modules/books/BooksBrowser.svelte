<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import FileText from '@lucide/svelte/icons/file-text';
	import FilterAside from '#lib/components/browser/FilterAside.svelte';
	import ListBody from '#lib/components/browser/ListBody.svelte';
	import MobileFilters from '#lib/components/browser/MobileFilters.svelte';
	import SearchRow from '#lib/components/browser/SearchRow.svelte';
	import { ListState, type InitialList } from '#lib/components/browser/list-state.svelte.ts';
	import { registerBrowser, restoreScroll } from '#lib/components/browser/snapshot.svelte.ts';
	import Img from '#lib/components/ui/Img.svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import { currentLocale, localePath } from '#lib/i18n/use-t.svelte.ts';
	import type { Book } from '#lib/types.ts';
	import { onMount, tick } from 'svelte';
	import { BOOKS } from './config.ts';

	let { initial, authors, categories }: { initial: InitialList<Book>; authors: FilterOption[]; categories: FilterOption[] } = $props();

	let scroller = $state<HTMLElement>();
	// svelte-ignore state_referenced_locally
	const list = new ListState<Book>(BOOKS, initial, () => scroller?.scrollTo({ top: 0 }));
	const locale = $derived(currentLocale());
	const grid = 'grid grid-cols-2 sm:grid-cols-3 lg:[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))] gap-4 sm:gap-5';

	onMount(() =>
		registerBrowser({
			capture: () => ({ ...list.capture(), scrollTop: scroller?.scrollTop ?? 0, windowY: window.scrollY }),
			restore: async (s) => {
				if (!list.restore(s as never)) return;
				await tick();
				restoreScroll(scroller, s);
			}
		})
	);
</script>

<div class="flex flex-col lg:flex-row gap-6 lg:items-stretch lg:flex-1 lg:min-h-0">
	<FilterAside cfg={BOOKS} {list} {authors} {categories} class="lg:w-[320px]" />

	<div class="min-w-0 flex flex-col lg:flex-1 lg:min-h-0">
		<MobileFilters cfg={BOOKS} {list} {authors} {categories} />
		<div class="flex flex-col min-h-0 lg:flex-1 rounded-2xl border border-border bg-card overflow-hidden">
			<div class="shrink-0 p-4"><SearchRow cfg={BOOKS} {list} {authors} {categories} chipClass="text-xs" /></div>
			<ListBody cfg={BOOKS} {list} icon={BookOpen} bind:scroller>
				{#snippet skeleton()}
					<div class={grid}>
						{#each Array(12) as _, i (i)}
							<div class="animate-pulse">
								<div class="aspect-[3/4] rounded-xl bg-muted mb-3"></div>
								<div class="h-4 bg-muted rounded mb-2"></div>
								<div class="h-3 bg-muted rounded w-2/3"></div>
							</div>
						{/each}
					</div>
				{/snippet}
				<div class={grid}>
					{#each list.items as book, i (book.id)}
						<a href={localePath(`/books/${book.id}`, locale)} data-sveltekit-preload-data="off" class="group">
							<div class="aspect-[3/4] relative rounded-xl overflow-hidden bg-muted mb-3 shadow-sm group-hover:shadow-md transition-all duration-200">
								<!-- Covers above the fold load eagerly: they are the page's LCP candidates. -->
								<Img
									src={book.coverUrl || '/images/default-book.png'}
									alt={book.title}
									eager={i < 4}
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
									class="object-cover group-hover:scale-[1.03] transition-transform duration-300"
								/>
								{#if book.documentUrl && book.chapterCount === 0}
									<div class="absolute top-2 right-2 bg-black/55 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 backdrop-blur-sm">
										<FileText class="w-2.5 h-2.5" /> PDF
									</div>
								{/if}
							</div>
							<p class="text-[14px] font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">{book.title}</p>
							{#if book.authors[0]}<p class="text-xs text-muted-foreground mt-1 truncate">{book.authors[0].name}</p>{/if}
						</a>
					{/each}
				</div>
			</ListBody>
		</div>
	</div>
</div>
