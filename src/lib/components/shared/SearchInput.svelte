<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import { cn } from '#lib/utils.ts';

	interface Props {
		value: string;
		placeholder: string;
		onchange: (value: string) => void;
		class?: string;
	}
	let { value, placeholder, onchange, class: className }: Props = $props();
</script>

<div class={cn('relative', className)}>
	<input
		type="text"
		{value}
		{placeholder}
		oninput={(e) => onchange(e.currentTarget.value)}
		class="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
	/>
	{#if value}
		<button type="button" onclick={() => onchange('')} aria-label="Clear" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
			><X class="w-4 h-4" /></button
		>
	{:else}
		<Search class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
	{/if}
</div>
