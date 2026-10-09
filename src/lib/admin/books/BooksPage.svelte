<script lang="ts">
	import BooksTabBar from './BooksTabBar.svelte';
	import BooksTable from './BooksTable.svelte';
	import NestedTable from './NestedTable.svelte';
	import type { BooksTab } from './types.ts';

	let tab = $state<BooksTab>('books');
</script>

<!-- Each tab owns its filters, sort and page; switching starts it fresh, as the Next dashboard did. -->
{#snippet bar()}<BooksTabBar {tab} ontab={(t) => (tab = t)} />{/snippet}

{#key tab}
	{#if tab === 'books'}
		<BooksTable tabs={bar} />
	{:else}
		<NestedTable kind={tab} tabs={bar} />
	{/if}
{/key}
