<script lang="ts">
	import { cn } from '#lib/utils.ts';

	interface Props {
		/** Any date inside the month on display. */
		month: Date;
		/** Selected day as `YYYY-MM-DD`, or ''. */
		selected: string;
		onselect: (iso: string) => void;
	}
	let { month, selected, onselect }: Props = $props();

	const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

	// Leading blanks, then the days of the month.
	const cells = $derived.by(() => {
		const y = month.getFullYear();
		const m = month.getMonth();
		const lead = new Date(y, m, 1).getDay();
		const days = new Date(y, m + 1, 0).getDate();
		return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => iso(y, m, i + 1))];
	});
	const today = iso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
</script>

<div class="p-3">
	<div class="grid grid-cols-7 pb-1">
		{#each WEEKDAYS as d (d)}<span class="text-center text-[0.8rem] text-muted-foreground">{d}</span>{/each}
	</div>
	<div class="grid grid-cols-7 gap-y-1">
		{#each cells as cell, i (i)}
			{#if cell}
				<button
					type="button"
					onclick={() => onselect(cell)}
					class={cn(
						'h-8 w-8 mx-auto rounded-md text-sm transition-colors',
						cell === selected
							? 'bg-primary text-primary-foreground'
							: cell === today
								? 'bg-accent text-accent-foreground font-semibold'
								: 'hover:bg-accent hover:text-accent-foreground'
					)}
				>
					{Number(cell.slice(8))}
				</button>
			{:else}
				<span></span>
			{/if}
		{/each}
	</div>
</div>
