<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		open?: boolean;
		/** Accessible name of the trigger button. */
		label: string;
		title?: string;
		align?: 'start' | 'end';
		/** Classes for the trigger button. */
		triggerClass?: string;
		/** Classes for the wrapper (use to absolutely position the trigger). */
		rootClass?: string;
		/** Classes for the floating panel. */
		class?: string;
		trigger: Snippet;
		children: Snippet<[close: () => void]>;
	}

	let { open = $bindable(false), label, title, align = 'start', triggerClass, rootClass, class: className, trigger, children }: Props = $props();
	let root = $state<HTMLElement>();

	const close = () => (open = false);
</script>

<svelte:window onpointerdown={(e) => open && root && !root.contains(e.target as Node) && close()} onkeydown={(e) => open && e.key === 'Escape' && close()} />

<div class={cn('relative inline-flex', rootClass)} bind:this={root}>
	<button type="button" aria-label={label} {title} aria-haspopup="true" aria-expanded={open} class={triggerClass} onclick={() => (open = !open)}>
		{@render trigger()}
	</button>
	{#if open}
		<div
			class={cn(
				'absolute z-50 mt-2 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in zoom-in-95 duration-100',
				align === 'end' ? 'right-0' : 'left-0',
				className
			)}
		>
			{@render children(close)}
		</div>
	{/if}
</div>
