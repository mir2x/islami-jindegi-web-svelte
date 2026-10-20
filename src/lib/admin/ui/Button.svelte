<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.ts';

	type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
	type Size = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		variant?: Variant;
		size?: Size;
		/** Renders an anchor instead of a button. */
		href?: string;
		target?: string;
		children: Snippet;
	}

	let { variant = 'default', size = 'default', href, class: className, children, ...rest }: Props = $props();

	const variants: Record<Variant, string> = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/80',
		outline: 'border-border bg-background hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-muted dark:hover:bg-muted/50',
		destructive: 'bg-red-600 text-white shadow-xs hover:bg-red-700',
		link: 'text-primary underline-offset-4 hover:underline'
	};
	const sizes: Record<Size, string> = {
		default: 'h-8 gap-1.5 px-2.5',
		sm: 'h-7 gap-1 rounded-md px-2.5 text-[0.8rem]',
		lg: 'h-9 gap-1.5 px-3',
		icon: 'size-8',
		'icon-sm': 'size-7 rounded-md'
	};
	const base =
		'inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4';
	const cls = $derived(cn(base, variants[variant], sizes[size], className));
</script>

{#if href}
	<a {href} target={rest.target as string | undefined} class={cls}>{@render children()}</a>
{:else}
	<button type="button" {...rest} class={cls}>{@render children()}</button>
{/if}
