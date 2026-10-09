<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		title: string;
		active?: boolean;
		disabled?: boolean;
		onclick: () => void;
		children: Snippet;
	}
	let { title, active, disabled, onclick, children }: Props = $props();
</script>

<!-- mousedown (not click) with preventDefault keeps the text selection while a command runs. -->
<button
	type="button"
	{title}
	aria-label={title}
	{disabled}
	onmousedown={(e) => {
		e.preventDefault();
		onclick();
	}}
	class={cn(
		'flex items-center justify-center w-7 h-7 rounded text-sm transition-colors',
		active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
		disabled && 'opacity-40 cursor-not-allowed'
	)}
>
	{@render children()}
</button>
