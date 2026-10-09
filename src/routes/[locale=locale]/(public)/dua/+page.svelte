<script lang="ts">
	import { browserSnapshot } from '#lib/components/browser/snapshot.svelte.ts';
	import DuaBrowser from '#lib/modules/dua/DuaBrowser.svelte';

	// Going back from a detail page restores the loaded list and scroll position.
	export const snapshot = browserSnapshot;

	let { data } = $props();
</script>

<div class="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 lg:h-[calc(100vh-68px)] lg:flex lg:flex-col">
	<h1 class="sr-only">{data.heading}</h1>
	{#key data}<DuaBrowser initial={data.initial} categories={data.categories} />{/key}
</div>
