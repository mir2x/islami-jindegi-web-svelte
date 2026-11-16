<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Globe from '@lucide/svelte/icons/globe';
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import Users from '@lucide/svelte/icons/users';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import Card from '../ui/Card.svelte';
	import AreaChart from './AreaChart.svelte';
	import { change, fmt } from './format.ts';
	import StatCard from './StatCard.svelte';
	import type { Insights } from './types.ts';

	let { data }: { data: Insights } = $props();
	const t = useT('Insights');
	const locale = $derived(currentLocale());
	const o = $derived(data.overview);
	const days = $derived(data.range === '7d' ? 7 : 30);
	const vs = $derived(t('vsPrevious', { days }));
</script>

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	<StatCard
		icon={Users}
		label={t('readers')}
		value={'~' + fmt(o.readers.mid, locale)}
		trend={change(o.readers.mid, o.previous?.mid)}
		trendLabel={vs}
		hint={t('readersHint', { low: o.readers.low, high: o.readers.high })}
	/>
	<StatCard icon={BookOpen} label={t('pagesRead')} value={fmt(o.pageViews, locale)} trend={change(o.pageViews, o.previous?.pageViews)} trendLabel={vs} hint={t('pagesReadHint')} />
	<StatCard icon={Globe} label={t('bangladesh')} value={fmt(o.bangladeshVisitors, locale)} hint={t('bangladeshHint')} />
	<StatCard icon={MonitorSmartphone} label={t('browserLoads')} value={o.browserLoads === null ? '–' : fmt(o.browserLoads, locale)} hint={t('browserLoadsHint')} />
</div>

<div class="mt-4 grid gap-4 lg:grid-cols-2">
	<Card title={t('chartReaders')}>
		<AreaChart points={o.readersByDay} unit={t('unitReaders')} />
	</Card>
	<Card title={t('chartPages')}>
		<AreaChart points={o.pageViewsByDay} unit={t('unitPages')} />
	</Card>
</div>

<details class="group mt-4 rounded-xl border bg-card p-5 text-sm">
	<summary class="cursor-pointer font-medium marker:text-muted-foreground">{t('howTitle')}</summary>
	<div class="mt-3 space-y-2 leading-relaxed text-muted-foreground">
		<p>{t('howOne')}</p>
		<p>{t('howTwo')}</p>
		<p>{t('howThree')}</p>
	</div>
</details>
