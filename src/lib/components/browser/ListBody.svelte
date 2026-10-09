<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { inView } from '#lib/actions.ts';
	import PageLinks from '#lib/components/shared/PageLinks.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ListState } from './list-state.svelte.ts';
	import type { BrowserConfig } from './types.ts';

	interface Props {
		cfg: BrowserConfig;
		list: ListState<{ id: string }>;
		icon: Component<{ class?: string }>;
		/** The scroll container, so the page can restore its position. */
		scroller?: HTMLElement;
		skeleton: Snippet;
		/** The loaded items (list rows or grid cards). */
		children: Snippet;
	}
	let { cfg, list, icon: Empty, scroller = $bindable(), skeleton, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	const t = useT(cfg.ns);
</script>

<div bind:this={scroller} class="lg:flex-1 lg:min-h-0 lg:overflow-y-auto px-4 pb-4">
	{#if list.loading}
		{@render skeleton()}
	{:else if list.items.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<Empty class="w-14 h-14 text-muted-foreground/25 mb-4" />
			<p class="text-xl font-medium text-foreground">{t('emptyTitle')}</p>
			<p class="text-base text-muted-foreground mt-1">{t('emptyHint')}</p>
			{#if list.hasFilters}
				<button type="button" onclick={list.clearAll} class="mt-4 text-base text-primary hover:underline">{t('clearFilters')}</button>
			{/if}
		</div>
	{:else}
		{@render children()}
	{/if}

	<!-- Scroll sentinel: re-created after each page so it fires again while still in view. -->
	{#if list.hasMore && !list.loading}
		{#key list.page}
			<div use:inView={() => list.loadMore()} class="py-6 text-center text-base text-muted-foreground">{list.loadingMore ? t('loading') : ''}</div>
		{/key}
	{/if}

	<!-- Real links to every page of the catalogue, for crawlers and shareable positions. -->
	{#if !list.loading && !list.hasFilters && list.filters.tab === 'all'}
		<PageLinks basePath={cfg.basePath} page={list.basePage} totalPages={list.totalPages} />
	{/if}
</div>
