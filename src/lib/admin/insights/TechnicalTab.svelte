<script lang="ts">
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import Card from '../ui/Card.svelte';
	import BarList from './BarList.svelte';
	import { clock, fmt, shortDay } from './format.ts';
	import StatCard from './StatCard.svelte';
	import type { Insights } from './types.ts';

	let { data }: { data: Insights } = $props();
	const t = useT('Insights');
	const locale = $derived(currentLocale());
	const x = $derived(data.technical);
</script>

<p class="mb-4 text-sm text-muted-foreground">{t('technicalNote')}</p>
<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	<StatCard label={t('botShare')} value={x.botShare.toFixed(1) + '%'} hint={t('botShareHint')} />
	<StatCard label={t('botRequests')} value={fmt(x.botRequests, locale)} />
	<StatCard label={t('probes')} value={fmt(x.scannerProbes, locale)} hint={t('probesHint')} />
	<StatCard label={t('notFound')} value={fmt(x.notFound, locale)} />
</div>

<div class="mt-4 grid gap-4 lg:grid-cols-2">
	<Card title={t('crawlers')}><BarList items={x.crawlers} /></Card>
	<Card title={t('scanners')}><BarList items={x.scanners} /></Card>
	<Card title={t('missing')}><BarList items={x.missing} /></Card>
	<Card title={t('noisy')}><BarList items={x.noisyIps} /></Card>
	<Card title={t('slow')}><BarList items={x.slowPages} name={(l) => l} /></Card>
	<Card title={t('statusClasses')}><BarList items={x.statusClasses} percent /></Card>
</div>

<Card title={t('failures')} class="mt-4">
	{#if x.recentFailures.length}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<tbody class="divide-y">
					{#each x.recentFailures as f (f.time + f.uri + f.ip)}
						<tr>
							<td class="py-2 pr-4 whitespace-nowrap text-muted-foreground">{shortDay(f.time.slice(0, 10), locale)} {clock(f.time, locale)}</td>
							<td class="py-2 pr-4 font-semibold tabular-nums">{f.status}</td>
							<td class="py-2 pr-4">{f.method}</td>
							<td class="max-w-md truncate py-2 pr-4" title={f.uri}>{f.uri}</td>
							<td class="py-2 text-muted-foreground">{f.country} · {f.ip}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="py-6 text-center text-sm text-muted-foreground">{t('noFailures')}</p>
	{/if}
</Card>
