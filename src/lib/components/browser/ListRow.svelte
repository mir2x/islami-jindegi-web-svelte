<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		href: string;
		selected: boolean;
		onselect: () => void;
		icon: Component<{ class?: string }>;
		/** Icon circle size: bayan rows are slightly larger. */
		large?: boolean;
		children: Snippet;
	}
	let { href, selected, onselect, icon: Icon, large = false, children }: Props = $props();

	// A plain click selects the row in the side panel; modified clicks keep normal link behaviour.
	function click(e: MouseEvent) {
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
		e.preventDefault();
		onselect();
	}
</script>

<a
	{href}
	data-sveltekit-preload-data="off"
	onclick={click}
	class={cn(
		'group w-full flex items-center gap-4 p-4 text-left rounded-xl border transition-colors',
		selected ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:bg-primary/5'
	)}
>
	<div
		class={cn(
			'shrink-0 rounded-full flex items-center justify-center transition-colors',
			large ? 'w-11 h-11' : 'w-10 h-10',
			selected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
		)}
	>
		<Icon class={large ? 'w-5 h-5' : 'w-4.5 h-4.5'} />
	</div>
	<div class="flex-1 min-w-0">{@render children()}</div>
</a>
