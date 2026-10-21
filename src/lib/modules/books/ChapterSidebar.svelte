<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import X from '@lucide/svelte/icons/x';
	import Img from '#lib/components/ui/Img.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BookDetail, SubChapter, Chapter } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { childrenOf, topLevelSubs, type ChapterNav } from './chapter-nav.svelte.ts';

	interface Props {
		book: BookDetail;
		nav: ChapterNav;
		open: boolean;
		onclose: () => void;
	}
	let { book, nav, open, onclose }: Props = $props();

	const t = useT('BookReader');
	const locale = $derived(currentLocale());
	const row = 'w-full text-left py-2.5 transition-colors leading-snug';
	const on = 'text-primary font-semibold bg-primary/8';
	const off = 'text-muted-foreground hover:text-foreground hover:bg-muted/50';

	function pickChapter(c: Chapter) {
		nav.pickChapter(c);
		onclose();
	}
	function pickSub(c: Chapter, s: SubChapter) {
		nav.pickSub(c, s);
		onclose();
	}
</script>

{#snippet tree(chapter: Chapter, subs: SubChapter[], depth: number)}
	{#each subs as sub (sub.id)}
		{@const children = childrenOf(chapter, sub.id)}
		<div>
			<button
				type="button"
				onclick={() => pickSub(chapter, sub)}
				class={cn(row, 'flex items-start justify-between gap-2 text-sm', depth === 0 ? 'pl-8 pr-4' : 'pl-12 pr-4', nav.isSubActive(sub.id) ? on : off)}
			>
				<span>{sub.title}</span>
				{#if children.length > 0}
					<span
						role="presentation"
						class="shrink-0 mt-0.5 text-muted-foreground/70"
						onclick={(e) => {
							e.stopPropagation();
							nav.toggle(sub.id);
						}}
					>
						{#if nav.expanded.has(sub.id)}<ChevronDown class="w-3.5 h-3.5" />{:else}<ChevronRight class="w-3.5 h-3.5" />{/if}
					</span>
				{/if}
			</button>
			{#if children.length > 0 && nav.expanded.has(sub.id)}{@render tree(chapter, children, depth + 1)}{/if}
		</div>
	{/each}
{/snippet}

{#if open}
	<button type="button" aria-label="Close" tabindex="-1" class="fixed inset-0 z-40 bg-black/50 lg:hidden cursor-default" onclick={onclose}></button>
{/if}

<aside
	class={cn(
		'fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-72 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0',
		open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
	)}
>
	<div class="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
		<a href={localePath('/books', locale)} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			><ArrowLeft class="w-4 h-4" />{t('booksLabel')}</a
		>
		<button type="button" onclick={onclose} aria-label="Close" class="lg:hidden p-1 text-muted-foreground hover:text-foreground"><X class="w-5 h-5" /></button>
	</div>

	<div class="px-4 py-3 border-b border-border shrink-0">
		<div class="flex gap-3 items-start">
			<div class="w-11 h-14 relative shrink-0 rounded-md overflow-hidden shadow-sm bg-muted">
				<Img src={book.coverUrl || '/images/default-book.png'} alt={book.title} sizes="44px" class="object-cover" />
			</div>
			<div class="min-w-0">
				<p class="text-sm font-bold text-foreground leading-snug line-clamp-2">{book.title}</p>
				{#if book.authors[0]}<p class="text-xs text-muted-foreground mt-0.5 truncate">{book.authors[0].name}</p>{/if}
				{#if book.categories[0]}<span class="inline-block mt-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">{book.categories[0].title}</span>{/if}
			</div>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto py-2 text-sm">
		{#if book.excerpt}
			<button
				type="button"
				onclick={() => {
					nav.intro();
					onclose();
				}}
				class={cn(row, 'px-4 text-sm', nav.active.kind === 'intro' ? on : off)}>{t('introduction')}</button
			>
		{/if}
		{#each book.chapters as chapter (chapter.id)}
			<div>
				<button
					type="button"
					onclick={() => pickChapter(chapter)}
					class={cn(
						'w-full text-left px-4 py-2.5 flex items-start justify-between gap-2 transition-colors',
						nav.isChapterActive(chapter.id) ? on : 'text-foreground hover:bg-muted/50'
					)}
				>
					<span class="leading-snug">{chapter.title}</span>
					{#if chapter.subChapters.length > 0}
						<span
							role="presentation"
							class="shrink-0 mt-0.5 text-muted-foreground"
							onclick={(e) => {
								e.stopPropagation();
								nav.toggle(chapter.id);
							}}
						>
							{#if nav.expanded.has(chapter.id)}<ChevronDown class="w-4 h-4" />{:else}<ChevronRight class="w-4 h-4" />{/if}
						</span>
					{/if}
				</button>
				{#if nav.expanded.has(chapter.id)}{@render tree(chapter, topLevelSubs(chapter), 0)}{/if}
			</div>
		{/each}
	</div>
</aside>
