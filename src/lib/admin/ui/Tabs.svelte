<script lang="ts">
	import { cn } from '#lib/utils.ts';

	interface Props {
		tabs: readonly { id: string; label: string }[];
		value: string;
		onchange: (id: string) => void;
		class?: string;
	}
	let { tabs, value, onchange, class: className }: Props = $props();
</script>

<div role="tablist" class={cn('inline-flex h-8 w-fit items-center rounded-lg border bg-card p-[3px] text-muted-foreground', className)}>
	{#each tabs as t (t.id)}
		<button
			type="button"
			role="tab"
			aria-selected={value === t.id}
			onclick={() => onchange(t.id)}
			class={cn(
				'h-full rounded-md px-1.5 text-sm font-medium whitespace-nowrap transition-colors',
				value === t.id ? 'bg-background text-foreground shadow-sm dark:bg-input/30' : 'hover:text-foreground'
			)}
		>
			{t.label}
		</button>
	{/each}
</div>
