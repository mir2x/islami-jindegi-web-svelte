<script lang="ts">
	import type { Component } from 'svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import MobileFilters from './MobileFilters.svelte';
	import type { ListState } from './list-state.svelte.ts';
	import SearchRow from './SearchRow.svelte';
	import TabsBar from './TabsBar.svelte';
	import type { BrowserConfig } from './types.ts';

	interface Props {
		cfg: BrowserConfig;
		list: ListState<{ id: string }>;
		authors: FilterOption[];
		categories: FilterOption[];
		textIcon: Component<{ class?: string }>;
		audioIcon: Component<{ class?: string }>;
	}
	let { cfg, list, authors, categories, textIcon, audioIcon }: Props = $props();
</script>

<!-- Top of the list card: tabs, mobile filter buttons, search and date, active-filter chips. -->
<div class="shrink-0 p-4">
	{#if cfg.tabs}<TabsBar {cfg} {list} {textIcon} {audioIcon} />{/if}
	<MobileFilters {cfg} {list} {authors} {categories} />
	<SearchRow {cfg} {list} {authors} {categories} />
</div>
