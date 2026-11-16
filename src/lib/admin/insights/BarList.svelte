<script lang="ts">
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { fmt } from './format.ts';
	import type { Slice } from './types.ts';

	interface Props {
		items: Slice[];
		/** Turns a raw label into what the reader should see ("BD" into "Bangladesh"). */
		name?: (label: string) => string;
		/** Show each row's share of the total next to its value. */
		percent?: boolean;
	}
	let { items, name = (l) => l, percent = false }: Props = $props();
	const t = useT('Insights');
	const locale = $derived(currentLocale());
	const max = $derived(Math.max(1, ...items.map((i) => i.value)));
	const total = $derived(items.reduce((a, i) => a + i.value, 0) || 1);
</script>

{#if items.length}
	<ul class="space-y-3">
		{#each items as item (item.label)}
			<li>
				<div class="flex items-baseline justify-between gap-3 text-sm">
					<span class="min-w-0 truncate" title={name(item.label)}>{name(item.label)}</span>
					<span class="shrink-0 font-medium tabular-nums">
						{fmt(item.value, locale)}{#if percent}<span class="ml-1.5 font-normal text-muted-foreground">{fmt((item.value / total) * 100, locale)}%</span>{/if}
					</span>
				</div>
				<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
					<div class="h-full rounded-full bg-primary" style="width:{Math.max(2, (item.value / max) * 100)}%"></div>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="py-6 text-center text-sm text-muted-foreground">{t('empty')}</p>
{/if}
