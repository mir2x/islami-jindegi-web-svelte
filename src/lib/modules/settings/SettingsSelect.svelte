<script lang="ts">
	interface Props {
		value: string;
		options: { value: string; label: string }[];
		onchange: (value: string) => void;
	}
	let { value, options, onchange }: Props = $props();
</script>

<select
	{value}
	onchange={(e) => onchange(e.currentTarget.value)}
	class="w-full px-3 py-2 rounded-xl border border-border bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
>
	{#each options as o (o.value)}<option value={o.value} selected={o.value === value}>{o.label}</option>{/each}
</select>
