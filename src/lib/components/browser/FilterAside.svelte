<script lang="ts">
	import FilterSidebar from '#lib/components/shared/FilterSidebar.svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import type { ListState } from './list-state.svelte.ts';
	import type { BrowserConfig } from './types.ts';

	interface Props {
		cfg: BrowserConfig;
		list: ListState<{ id: string }>;
		authors: FilterOption[];
		categories: FilterOption[];
		/** Width classes of the column. */
		class?: string;
	}
	let { cfg, list, authors, categories, class: className = 'lg:w-[17.5rem]' }: Props = $props();

	// svelte-ignore state_referenced_locally
	const t = useT(cfg.ns);
	const authorKey = $derived(cfg.authorKey ?? 'author');
</script>

<!-- Desktop sidebar: author and category lists share one card. -->
{#if authors.length > 0 || categories.length > 0}
	<aside class={cn('hidden lg:flex print:hidden lg:shrink-0 lg:min-h-0', className)}>
		<div class="flex flex-col gap-12 w-full min-h-0 rounded-2xl border border-border bg-card overflow-hidden">
			{#if authors.length > 0}
				<FilterSidebar fill title={t(authorKey)} items={authors} selected={list.filters.author} onselect={list.setAuthor} emptyText={t(`${authorKey}Empty`)} />
			{/if}
			{#if categories.length > 0}
				<FilterSidebar fill title={t('category')} items={categories} selected={list.filters.category} onselect={list.setCategory} emptyText={t('categoryEmpty')} />
			{/if}
		</div>
	</aside>
{/if}
