<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		onclose: () => void;
		/** `bottom`: a sheet on phones, centred on larger screens. `top`: a search-style panel near the top. */
		align?: 'bottom' | 'top';
		/** Classes of the panel (width, height, background). */
		class?: string;
		/** Extra classes for the full-screen wrapper. */
		containerClass?: string;
		label?: string;
		children: Snippet;
	}
	let { onclose, align = 'bottom', class: className, containerClass, label, children }: Props = $props();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class={cn('fixed inset-0 z-[60] flex justify-center', align === 'bottom' ? 'items-end sm:items-center' : 'items-start', containerClass)}>
	<button type="button" tabindex="-1" aria-label="Close" class="absolute inset-0 bg-black/50 backdrop-blur-[1px] cursor-default" onclick={onclose}></button>
	<div role="dialog" aria-modal="true" aria-label={label} class={cn('relative flex flex-col bg-background border border-border shadow-2xl overflow-hidden', className)}>
		{@render children()}
	</div>
</div>
