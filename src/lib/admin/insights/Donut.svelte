<script lang="ts">
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { fmt } from './format.ts';
	import type { Slice } from './types.ts';

	let { items, name = (l: string) => l }: { items: Slice[]; name?: (label: string) => string } = $props();
	const t = useT('Insights');
	const locale = $derived(currentLocale());
	const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--muted-foreground)'];
	const total = $derived(items.reduce((a, i) => a + i.value, 0) || 1);
	const R = 42;
	const C = 2 * Math.PI * R;
	const arcs = $derived(
		items.map((it, i) => {
			const before = items.slice(0, i).reduce((a, x) => a + x.value, 0);
			return { it, color: COLORS[i % COLORS.length], len: (it.value / total) * C, offset: -(before / total) * C };
		})
	);
</script>

{#if items.length}
	<div class="flex items-center gap-6">
		<svg viewBox="0 0 100 100" class="size-28 shrink-0 -rotate-90" role="img" aria-label={items.map((i) => name(i.label)).join(', ')}>
			<circle cx="50" cy="50" r={R} fill="none" stroke="var(--muted)" stroke-width="12" />
			{#each arcs as a (a.it.label)}
				<circle cx="50" cy="50" r={R} fill="none" stroke={a.color} stroke-width="12" stroke-dasharray="{Math.max(0, a.len - 1)} {C}" stroke-dashoffset={a.offset} />
			{/each}
		</svg>
		<ul class="min-w-0 flex-1 space-y-2 text-sm">
			{#each arcs as a (a.it.label)}
				<li class="flex items-center gap-2">
					<span class="size-2.5 shrink-0 rounded-full" style="background:{a.color}"></span>
					<span class="min-w-0 flex-1 truncate">{name(a.it.label)}</span>
					<span class="font-medium tabular-nums">{fmt((a.it.value / total) * 100, locale)}%</span>
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<p class="py-6 text-center text-sm text-muted-foreground">{t('empty')}</p>
{/if}
