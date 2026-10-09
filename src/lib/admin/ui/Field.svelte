<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		label: string;
		required?: boolean;
		/** Small grey text next to the label. */
		hint?: string;
		/** Right-aligned text on the label row, e.g. a character counter. */
		aside?: string;
		class?: string;
		children: Snippet;
	}
	let { label, required, hint, aside, class: className, children }: Props = $props();
</script>

<div class={cn('space-y-1.5', className)}>
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="flex items-center gap-2 text-sm leading-none font-medium select-none">
		{#if label}<span>{label}</span>{/if}
		{#if required}<span class="text-destructive">*</span>{/if}
		{#if hint}<span class="ml-2 text-xs text-muted-foreground font-normal">{hint}</span>{/if}
		{#if aside}<span class="ml-auto text-xs text-muted-foreground font-normal">{aside}</span>{/if}
	</label>
	{@render children()}
</div>
