<script lang="ts">
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Mic from '@lucide/svelte/icons/mic';
	import ListBrowser from '#lib/components/browser/ListBrowser.svelte';
	import ListRow from '#lib/components/browser/ListRow.svelte';
	import { rowTitle } from '#lib/components/browser/classes.ts';
	import type { InitialList } from '#lib/components/browser/list-state.svelte.ts';
	import type { FilterOption } from '#lib/filters.ts';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';
	import type { BayanListItem } from '#lib/types.ts';
	import BayanPanel from './BayanPanel.svelte';
	import { BAYAN } from './config.ts';

	let { initial, authors, categories }: { initial: InitialList<BayanListItem>; authors: FilterOption[]; categories: FilterOption[] } = $props();
	const locale = $derived(currentLocale());
</script>

<ListBrowser
	cfg={BAYAN}
	{initial}
	{authors}
	{categories}
	icon={Mic}
	large
	info={(d: BayanListItem) => ({ title: d.title, share: [d.title, d.author.name, d.excerpt].filter(Boolean).join('\n\n') })}
>
	{#snippet row(item: BayanListItem, ctx)}
		<ListRow {...ctx} icon={Mic} large>
			<p class={rowTitle(ctx.selected, 1)}>{item.title}</p>
			<div class="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
				<span class="truncate">{item.author.name}</span>
				{#if item.location}<span class="flex items-center gap-0.5 truncate"><MapPin class="w-3 h-3 shrink-0" />{item.location}</span>{/if}
			</div>
			<p class="mt-1 text-sm text-muted-foreground tabular-nums">{formatDate(item.publishedAt, locale, { order: 'month-first' })}</p>
		</ListRow>
	{/snippet}
	{#snippet subtitle(d: BayanListItem)}<p class="text-base text-muted-foreground mt-1">{d.author.name}</p>{/snippet}
	{#snippet body(d: BayanListItem)}{#key d.id}<BayanPanel {d} />{/key}{/snippet}
</ListBrowser>
