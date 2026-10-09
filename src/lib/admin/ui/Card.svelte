<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';
	import { sectionTitleCls } from './classes.ts';

	interface Props {
		title?: string;
		required?: boolean;
		/** `default` is the content editors' card; `compact` the book form's; `roomy` the single-column forms'. */
		variant?: 'default' | 'compact' | 'roomy';
		class?: string;
		children: Snippet;
	}
	let { title, required, variant = 'default', class: className, children }: Props = $props();

	const BOX = { default: 'p-4 sm:p-5 space-y-4', compact: 'p-4 space-y-3', roomy: 'p-5 space-y-4' };
</script>

<section class={cn('bg-card border rounded-xl', BOX[variant], className)}>
	{#if title}<h2 class={cn(sectionTitleCls, variant !== 'default' && 'text-xs')}>
			{title}{#if required}
				<span class="text-destructive">*</span>{/if}
		</h2>{/if}
	{@render children()}
</section>
