<script lang="ts">
	import { onDestroy } from 'svelte';
	import HierarchySideList from '#lib/admin/books/HierarchySideList.svelte';
	import { hierarchy } from '#lib/admin/books/hierarchy.svelte.ts';
	import Skeleton from '#lib/admin/ui/Skeleton.svelte';

	let { children } = $props();

	onDestroy(() => {
		hierarchy.bookId = '';
		hierarchy.currentId = undefined;
	});
</script>

<div class="flex h-full">
	{#if hierarchy.bookId}
		{#key hierarchy.bookId}<HierarchySideList bookId={hierarchy.bookId} currentId={hierarchy.currentId} currentType={hierarchy.currentType} />{/key}
	{:else if hierarchy.currentId}
		<div class="hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border w-80 shrink-0 p-4 space-y-4">
			<Skeleton class="h-10 w-full" /><Skeleton class="h-10 w-full" />
		</div>
	{/if}
	<div class="flex-1 overflow-y-auto">{@render children()}</div>
</div>
