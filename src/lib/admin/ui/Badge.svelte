<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		variant?: 'outline' | 'secondary' | 'default';
		class?: string;
		children: Snippet;
	}
	let { variant = 'outline', class: className, children }: Props = $props();
	const variants = { outline: 'border-border text-foreground', secondary: 'bg-secondary text-secondary-foreground', default: 'bg-primary text-primary-foreground' };
</script>

<span
	class={cn(
		'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full border border-transparent px-2 text-xs font-medium whitespace-nowrap',
		variants[variant],
		className
	)}>{@render children()}</span
>
