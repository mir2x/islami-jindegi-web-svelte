<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import DateFilter from '#lib/components/shared/DateFilter.svelte';
	import SearchInput from '#lib/components/shared/SearchInput.svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ListState } from './list-state.svelte.ts';
	import type { BrowserConfig } from './types.ts';

	interface Props {
		cfg: BrowserConfig;
		list: ListState<{ id: string }>;
		authors: FilterOption[];
		categories: FilterOption[];
		/** Chip text size: books use the compact one. */
		chipClass?: string;
	}
	let { cfg, list, authors, categories, chipClass = 'text-sm' }: Props = $props();

	// svelte-ignore state_referenced_locally
	const t = useT(cfg.ns);
	const f = $derived(list.filters);
	const authorName = $derived(authors.find((a) => a.id === f.author)?.label);
	const categoryName = $derived(categories.find((c) => c.id === f.category)?.label);
	const chip = $derived(`inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium ${chipClass}`);
</script>

<div class="flex items-center gap-2">
	<SearchInput class="min-w-0 flex-1" value={f.search} onchange={list.setSearch} placeholder={t('searchPlaceholder')} />
	{#if cfg.dated}<DateFilter value={{ from: f.dateFrom, to: f.dateTo }} onchange={list.setDates} />{/if}
</div>

{#if categoryName || authorName}
	<div class="flex items-center gap-1.5 flex-wrap mt-4">
		{#if categoryName}
			<span class={chip}
				>{categoryName}<button type="button" aria-label="Remove" onclick={() => list.setCategory(f.category)} class="hover:bg-primary/20 rounded-full p-0.5"
					><X class="w-3 h-3" /></button
				></span
			>
		{/if}
		{#if authorName}
			<span class={chip}
				>{authorName}<button type="button" aria-label="Remove" onclick={() => list.setAuthor(f.author)} class="hover:bg-primary/20 rounded-full p-0.5"><X class="w-3 h-3" /></button
				></span
			>
		{/if}
		<button type="button" onclick={list.clearAll} class="{chipClass} text-muted-foreground hover:text-foreground hover:underline ml-1">{t('clearAll')}</button>
	</div>
{/if}
