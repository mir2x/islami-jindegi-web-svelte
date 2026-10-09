<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { FilterOption } from '#lib/filters.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		title: string;
		items: FilterOption[];
		selected: string;
		onselect: (id: string) => void;
		emptyText: string;
		/** Stretch to fill the height of its flex column instead of capping at max-h-72. */
		fill?: boolean;
	}
	let { title, items, selected, onselect, emptyText, fill = false }: Props = $props();

	const t = useT('Common');
	let search = $state('');
	const shown = $derived(search.trim() ? items.filter((i) => i.label.toLowerCase().includes(search.trim().toLowerCase())) : items);
</script>

<!-- Title + inline search + option list, without card chrome, so sections can share one card. -->
<div class={cn('flex flex-col', fill && 'flex-1 min-h-0 basis-0')}>
	<div class="px-4 pt-4 pb-3 shrink-0 flex items-center gap-3">
		<p class="text-lg font-semibold uppercase tracking-wider text-foreground">{title}</p>
		<div class="relative ml-auto w-36 shrink-0">
			<Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
			<input
				bind:value={search}
				placeholder={t('searchPlaceholder')}
				class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-muted text-base focus:outline-none focus:ring-2 focus:ring-ring"
			/>
		</div>
	</div>
	<!-- The box height is whatever the flex layout leaves over, so fade the remainder instead of slicing a row. -->
	<div
		class={cn(
			'overflow-y-auto px-2 pb-2 [scrollbar-gutter:stable] snap-y snap-mandatory [&>button:last-child]:border-b-0 [mask-image:linear-gradient(to_bottom,black_calc(100%-20px),transparent)]',
			fill ? 'flex-1 min-h-0' : 'max-h-72'
		)}
	>
		{#each shown as item (item.id)}
			<button
				type="button"
				onclick={() => onselect(item.id)}
				class={cn(
					'w-full flex items-center justify-between gap-2 text-left px-2.5 py-2 text-base transition-colors snap-start border-b border-border/60 h-9',
					selected === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
				)}
			>
				<span class="truncate">{item.label}</span>
			</button>
		{/each}
		{#if shown.length === 0}<p class="text-sm text-muted-foreground px-2.5 py-2">{emptyText}</p>{/if}
	</div>
</div>
