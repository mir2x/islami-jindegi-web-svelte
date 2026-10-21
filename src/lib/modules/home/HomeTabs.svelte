<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Mic from '@lucide/svelte/icons/mic';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import type { Component } from 'svelte';
	import { inView } from '#lib/actions.ts';
	import Img from '#lib/components/ui/Img.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { MODULE_DEFAULT_SORT as SORT } from '#lib/modules.ts';
	import type { ArticleListItem, BayanListItem, Book, MalfuzatListItem } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { PagedFeed } from './paged-feed.svelte.ts';

	interface Props {
		books: { data: Book[]; total: number };
		bayans: { data: BayanListItem[]; total: number };
		malfuzat: { data: MalfuzatListItem[]; total: number };
		articles: { data: ArticleListItem[]; total: number };
	}
	let { books, bayans, malfuzat, articles }: Props = $props();

	type Key = 'books' | 'bayans' | 'malfuzat' | 'articles';
	const t = useT('Home');
	const locale = $derived(currentLocale());
	let tab = $state<Key>('books');

	/* svelte-ignore state_referenced_locally */
	const feeds = {
		books: new PagedFeed<Book>('/api/books', SORT.book, books.data, books.total),
		bayans: new PagedFeed<BayanListItem>('/api/bayan', SORT.bayan, bayans.data, bayans.total),
		malfuzat: new PagedFeed<MalfuzatListItem>('/api/malfuzat', SORT.malfuzat, malfuzat.data, malfuzat.total),
		articles: new PagedFeed<ArticleListItem>('/api/articles', SORT.article, articles.data, articles.total)
	};
	const TABS = $derived<{ key: Key; label: string; href: string }[]>([
		{ key: 'books', label: t('tabBooks'), href: '/books' },
		{ key: 'bayans', label: t('tabBayans'), href: '/bayan' },
		{ key: 'malfuzat', label: t('tabMalfuzat'), href: '/malfuzat' },
		{ key: 'articles', label: t('tabArticles'), href: '/articles' }
	]);
	const active = $derived(feeds[tab]);
	const compact = $derived<Record<Exclude<Key, 'books'>, { items: { id: string; title: string; subtitle?: string | null }[]; href: string; icon: Component<{ class?: string }> }>>({
		bayans: { items: feeds.bayans.items.map((b) => ({ id: b.id, title: b.title, subtitle: b.author?.name })), href: '/bayan', icon: Mic },
		malfuzat: { items: feeds.malfuzat.items.map((m) => ({ id: m.id, title: m.title, subtitle: m.author?.name })), href: '/malfuzat', icon: ScrollText },
		articles: { items: feeds.articles.items.map((a) => ({ id: a.id, title: a.title, subtitle: a.author?.name ?? null })), href: '/articles', icon: Newspaper }
	});
</script>

<div class="shrink-0 flex items-center justify-between gap-2 px-4 lg:px-5 pt-4 pb-3 border-b border-border/30">
	<div class="flex gap-0.5 bg-muted rounded-xl p-1 overflow-x-auto">
		{#each TABS as { key, label } (key)}
			<button
				type="button"
				onclick={() => (tab = key)}
				class={cn(
					'px-2.5 lg:px-3 py-1.5 rounded-lg text-base lg:text-lg font-medium transition-all whitespace-nowrap',
					tab === key ? 'bg-background text-primary shadow-sm' : 'text-foreground/55 hover:text-foreground'
				)}>{label}</button
			>
		{/each}
	</div>
	<div class="flex items-center gap-2 shrink-0">
		<a
			href={localePath(TABS.find((x) => x.key === tab)?.href ?? '/', locale)}
			class="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-base font-medium text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors whitespace-nowrap"
			>{t('viewAllArrow').replace(/\s*→\s*$/, '')}<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></a
		>
		<a
			href={localePath('/explore', locale)}
			class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
			><Sparkles class="w-4 h-4" />{t('newLayoutLink').replace(/\s*→\s*$/, '')}</a
		>
	</div>
</div>

<div class="flex-1 min-h-0 overflow-y-auto p-4 lg:p-5">
	{#if tab === 'books'}
		<div class="divide-y divide-border/50">
			{#each feeds.books.items as b, i (b.id)}
				<a
					href={localePath(`/books/${b.id}`, locale)}
					data-sveltekit-preload-data="off"
					class="group flex gap-4 py-4 first:pt-0 -mx-4 px-4 hover:bg-muted/30 transition-colors rounded-xl"
				>
					<div class="relative w-20 sm:w-24 shrink-0 rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-shadow" style="aspect-ratio: 3/4">
						<Img src={b.coverUrl || '/images/default-book.png'} alt={b.title} eager={i < 2} sizes="96px" class="object-cover" />
					</div>
					<div class="flex-1 min-w-0 py-1">
						<p class="font-semibold text-xl text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{b.title}</p>
						{#if b.authors[0]}<p class="text-lg text-foreground/70 mt-1">{b.authors[0].name}</p>{/if}
						{#if b.excerpt}<p class="text-lg text-foreground/60 mt-1.5 line-clamp-2 leading-relaxed">{b.excerpt}</p>{/if}
					</div>
				</a>
			{/each}
		</div>
	{:else}
		{@const list = compact[tab]}
		{@const Icon = list.icon}
		<div class="space-y-0.5">
			{#each list.items as item (item.id)}
				<a
					href={localePath(`${list.href}/${item.id}`, locale)}
					data-sveltekit-preload-data="off"
					class="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors"
				>
					<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Icon class="w-4 h-4 text-primary" /></div>
					<div class="flex-1 min-w-0">
						<p class="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
						{#if item.subtitle}<p class="text-base text-foreground/60 truncate">{item.subtitle}</p>{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}

	<!-- Pulls in the next page as the panel is scrolled; re-created per page so it fires again while still in view. -->
	{#key `${tab}-${active.items.length}`}{#if active.hasMore}<div use:inView={active.loadMore}></div>{/if}{/key}
	{#if active.loading}<div class="flex justify-center py-4"><Loader2 class="w-4 h-4 animate-spin text-primary" /></div>{/if}
</div>
