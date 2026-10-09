<script lang="ts" generics="V extends string">
	import { cn } from '#lib/utils.ts';

	interface Props {
		options: { value: V; label: string }[];
		value: V;
		onchange: (value: V) => void;
		class?: string;
	}
	let { options, value, onchange, class: className }: Props = $props();
</script>

<div class={cn('grid gap-2', className)} style:grid-template-columns="repeat({options.length}, minmax(0, 1fr))">
	{#each options as o (o.value)}
		<button
			type="button"
			onclick={() => onchange(o.value)}
			class={cn(
				'rounded-lg border px-3 py-2 text-sm transition-colors',
				value === o.value ? 'border-primary bg-primary/10 text-foreground font-medium' : 'text-muted-foreground hover:bg-muted/50'
			)}>{o.label}</button
		>
	{/each}
</div>
