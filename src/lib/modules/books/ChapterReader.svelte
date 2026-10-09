<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FileText from '@lucide/svelte/icons/file-text';
	import Menu from '@lucide/svelte/icons/menu';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Tag from '@lucide/svelte/icons/tag';
	import User from '@lucide/svelte/icons/user';
	import AdminEditButton from '#lib/components/shared/AdminEditButton.svelte';
	import TopicLinks from '#lib/components/shared/TopicLinks.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BookDetail } from '#lib/types.ts';
	import { ChapterNav, titleOf } from './chapter-nav.svelte.ts';
	import ChapterSidebar from './ChapterSidebar.svelte';

	let { book, onSwitchToPdf }: { book: BookDetail; onSwitchToPdf?: () => void } = $props();

	const t = useT('BookReader');
	// svelte-ignore state_referenced_locally
	const nav = new ChapterNav(book);
	let drawerOpen = $state(false);
	let fontSize = $state(18);
	let contentEl = $state<HTMLElement>();

	// Back to the top whenever another chapter opens.
	$effect(() => {
		void nav.active;
		contentEl?.scrollTo({ top: 0, behavior: 'smooth' });
	});

	const content = $derived(nav.content);
	// Inline pixel font sizes from the CMS scale with the reader's font size.
	const body = $derived(content.body?.replace(/font-size:\s*(\d+(?:\.\d+)?)px/g, 'font-size: calc($1px * var(--text-scale))') ?? null);
	const navBtn = 'flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%]';
	const stepBtn = 'p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded';
</script>

<div class="flex h-full overflow-hidden bg-background">
	<!-- The record on screen is what gets edited: the chapter or subchapter being read, else the book. -->
	{#if nav.active.kind === 'chapter'}<AdminEditButton entity="chapters" id={nav.active.chapter.id} />
	{:else if nav.active.kind === 'sub'}<AdminEditButton entity="subchapters" id={nav.active.sub.id} />
	{:else}<AdminEditButton entity="books" id={book.id} />{/if}
	<ChapterSidebar {book} {nav} open={drawerOpen} onclose={() => (drawerOpen = false)} />

	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
		<div class="flex items-center gap-3 px-4 h-14 border-b border-border bg-card shrink-0">
			<button
				type="button"
				onclick={() => (drawerOpen = true)}
				class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
				aria-label={t('openNavigation')}><Menu class="w-5 h-5" /></button
			>
			<p class="hidden sm:block flex-1 text-sm font-semibold text-foreground truncate min-w-0">{book.title}</p>

			<div class="ml-auto flex items-center gap-2 shrink-0">
				<div class="flex items-center gap-0.5 border border-border rounded-lg px-1 py-0.5">
					<button type="button" aria-label="Smaller" onclick={() => (fontSize = Math.max(14, fontSize - 2))} class={stepBtn}><Minus class="w-3.5 h-3.5" /></button>
					<span class="text-xs text-muted-foreground w-7 text-center tabular-nums">{fontSize}</span>
					<button type="button" aria-label="Larger" onclick={() => (fontSize = Math.min(28, fontSize + 2))} class={stepBtn}><Plus class="w-3.5 h-3.5" /></button>
				</div>
				{#if book.documentUrl}
					{#if onSwitchToPdf}
						<button
							type="button"
							onclick={onSwitchToPdf}
							class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
							><FileText class="w-3.5 h-3.5" />{t('readPdf')}</button
						>
					{:else}
						<a
							href={book.documentUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors">PDF</a
						>
					{/if}
				{/if}
			</div>
		</div>

		<div bind:this={contentEl} class="flex-1 overflow-y-auto">
			<div class="max-w-3xl mx-auto px-4 sm:px-8 py-10">
				<h1 class="text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight">{content.title}</h1>

				{#if nav.active.kind === 'intro' && (book.authors.length > 0 || book.categories.length > 0)}
					<div class="flex flex-wrap gap-3 mb-6 pb-6 border-b border-border/60">
						{#if book.authors.length > 0}<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
								<User class="w-4 h-4" />{book.authors.map((a) => a.name).join(', ')}
							</div>{/if}
						{#if book.categories.length > 0}<div class="flex items-center gap-1.5 flex-wrap text-sm text-muted-foreground">
								<Tag class="w-4 h-4" /><TopicLinks categories={book.categories} />
							</div>{/if}
					</div>
				{/if}

				{#if body}
					<div class="prose-content" style:--text-scale={fontSize / 18} style:font-size="{fontSize}px" style:line-height="1.9">{@html body}</div>
				{:else if nav.childIndex.length > 0}
					<div>
						<p class="text-sm text-muted-foreground mb-4">{t('chapterIndexHint')}</p>
						<div class="space-y-2">
							{#each nav.childIndex as item (item.id)}
								<button
									type="button"
									onclick={() => nav.active.kind !== 'intro' && nav.pickSub(nav.active.chapter, item)}
									class="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
								>
									<span class="text-sm font-medium text-foreground">{item.title}</span><ChevronRight class="w-4 h-4 text-muted-foreground shrink-0" />
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<p class="text-muted-foreground italic text-base">{t('noChapterContent')}</p>
				{/if}

				{#if nav.prev || nav.next}
					<div class="flex items-center justify-between mt-12 pt-8 border-t border-border/60 gap-4">
						{#if nav.prev}
							{@const prev = nav.prev}
							<button type="button" onclick={() => nav.go(prev)} class="{navBtn} text-left"
								><ArrowLeft class="w-4 h-4 shrink-0" /><span class="line-clamp-1">{titleOf(prev, t('introduction'))}</span></button
							>
						{:else}<div></div>{/if}
						{#if nav.next}
							{@const next = nav.next}
							<button type="button" onclick={() => nav.go(next)} class="{navBtn} text-right ml-auto"
								><span class="line-clamp-1">{titleOf(next, t('introduction'))}</span><ChevronRight class="w-4 h-4 shrink-0" /></button
							>
						{:else}<div></div>{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
