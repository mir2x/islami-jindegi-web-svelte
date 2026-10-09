<script lang="ts">
	import { fetchOptions } from '#lib/client-api.ts';
	import MobileFilter from '#lib/components/shared/MobileFilter.svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ListState } from './list-state.svelte.ts';
	import type { BrowserConfig } from './types.ts';

	interface Props {
		cfg: BrowserConfig;
		list: ListState<{ id: string }>;
		authors: FilterOption[];
		categories: FilterOption[];
	}
	let { cfg, list, authors, categories }: Props = $props();

	// svelte-ignore state_referenced_locally
	const t = useT(cfg.ns);
	const authorKey = $derived(cfg.authorKey ?? 'author');
</script>

<!-- Mobile-only select buttons: on desktop the sidebar card carries these filters. -->
{#if authors.length > 0 || categories.length > 0}
	<div class="flex lg:hidden gap-2 mb-2.5">
		{#if authors.length > 0}
			<MobileFilter
				title={t(authorKey)}
				options={authors}
				selected={list.filters.author}
				onselect={list.setAuthor}
				emptyText={t(`${authorKey}Empty`)}
				fetchOptions={(q) => fetchOptions(`${cfg.api}/authors`, q, 'name')}
			/>
		{/if}
		{#if categories.length > 0}
			<MobileFilter
				title={t('category')}
				options={categories}
				selected={list.filters.category}
				onselect={list.setCategory}
				emptyText={t('categoryEmpty')}
				fetchOptions={(q) => fetchOptions(`${cfg.api}/categories`, q, 'title')}
			/>
		{/if}
	</div>
{/if}
