<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		title?: string;
		open?: boolean;
		/** Classes for the trigger button; omit for a trigger the caller renders itself (`custom`). */
		triggerClass?: string;
		popupClass?: string;
		trigger: Snippet;
		children: Snippet<[close: () => void]>;
	}
	let { title, open = $bindable(false), triggerClass, popupClass, trigger, children }: Props = $props();
	let root = $state<HTMLElement>();
	const close = () => (open = false);
</script>

<svelte:window onmousedown={(e) => open && root && !root.contains(e.target as Node) && close()} />

<div class="relative" bind:this={root}>
	<button
		type="button"
		{title}
		aria-label={title}
		aria-expanded={open}
		onmousedown={(e) => {
			e.preventDefault();
			open = !open;
		}}
		class={cn(
			'flex items-center rounded text-xs transition-colors',
			open ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
			triggerClass
		)}
	>
		{@render trigger()}
	</button>
	{#if open}
		<div class={cn('absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-lg', popupClass)}>
			{@render children(close)}
		</div>
	{/if}
</div>
