<script lang="ts">
	import { cn } from '#lib/utils.ts';

	interface Props {
		options: { value: string; label: string }[];
		/** The chosen value(s): a string for single choice, a list for multiple. */
		selected: string | string[];
		onpick: (value: string) => void;
		class?: string;
	}
	let { options, selected, onpick, class: className }: Props = $props();
	const on = (v: string) => (Array.isArray(selected) ? selected.includes(v) : selected === v);
</script>

<div class={cn('flex flex-wrap gap-2', className)}>
	{#each options as o (o.value)}
		<button
			type="button"
			onclick={() => onpick(o.value)}
			aria-pressed={on(o.value)}
			class={cn(
				'px-3 py-1.5 rounded-lg text-sm transition-colors',
				on(o.value) ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
			)}>{o.label}</button
		>
	{/each}
</div>
