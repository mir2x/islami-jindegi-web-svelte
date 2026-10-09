<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { cn } from '#lib/utils.ts';
	import type { Sort } from '../list/sort.ts';

	interface Props {
		label: string;
		sortKey: string;
		sort: Sort;
		onsort: (key: string) => void;
	}
	let { label, sortKey, sort, onsort }: Props = $props();

	const active = $derived(sort.key === sortKey);
	const Icon = $derived(!active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown);
</script>

<th class="text-left px-5 py-3.5" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
	<button
		type="button"
		onclick={() => onsort(sortKey)}
		class={cn(
			'group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wider transition-colors',
			active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
		)}
	>
		{label}
		<Icon class={cn('w-3.5 h-3.5 shrink-0', active ? 'opacity-100' : 'opacity-40 group-hover:opacity-70')} />
	</button>
</th>
