<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import Skeleton from './Skeleton.svelte';

	interface Props {
		load: () => Promise<T>;
		/** Rendered once the record is loaded. */
		children: Snippet<[T]>;
		notFound?: string;
		/** Skeleton width class for the loading state. */
		width?: string;
	}
	let { load, children, notFound = 'Not found.', width = 'max-w-3xl' }: Props = $props();

	let item = $state.raw<T | null>(null);
	let loading = $state(true);

	// Reruns (and drops stale answers) when `load` changes, i.e. when the id in the URL changes.
	$effect(() => {
		let cancelled = false;
		loading = true;
		load()
			.then((res) => !cancelled && (item = res))
			.catch(() => !cancelled && (item = null))
			.finally(() => !cancelled && (loading = false));
		return () => (cancelled = true);
	});
</script>

{#if loading}
	<div class="{width} mx-auto px-6 py-8 space-y-4"><Skeleton class="h-5 w-24" /><Skeleton class="h-8 w-48" /><Skeleton class="h-64 w-full rounded-xl" /></div>
{:else if !item}
	<div class="p-8 text-center text-muted-foreground">{notFound}</div>
{:else}
	{#key (item as { id?: string }).id}{@render children(item)}{/key}
{/if}
