<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { cn } from '#lib/utils.ts';
	import { triggerCls } from './classes.ts';

	interface Props {
		value: string;
		options: readonly (string | { value: string; label: string })[];
		onchange?: (value: string) => void;
		class?: string;
		/** Highlights the trigger when a non-empty value (an active filter) is chosen. */
		filter?: boolean;
		id?: string;
	}
	let { value = $bindable(), options, onchange, class: className, filter, id }: Props = $props();

	const opts = $derived(options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)));
</script>

<div class={cn('relative', className)}>
	<select {id} bind:value onchange={() => onchange?.(value)} class={cn(triggerCls, 'appearance-none pr-7 bg-card', filter && value && 'border-primary')}>
		{#each opts as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
	</select>
	<ChevronDown class="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
</div>
