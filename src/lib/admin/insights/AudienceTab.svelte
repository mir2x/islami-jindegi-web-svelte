<script lang="ts">
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import Card from '../ui/Card.svelte';
	import BarList from './BarList.svelte';
	import Donut from './Donut.svelte';
	import { countryName } from './format.ts';
	import type { Insights } from './types.ts';

	let { data }: { data: Insights } = $props();
	const t = useT('Insights');
	const locale = $derived(currentLocale());
	const a = $derived(data.audience);
	const device = (l: string) => ({ Desktop: t('desktop'), Mobile: t('mobile'), Tablet: t('tablet') })[l] ?? l;
	const language = (l: string) => ({ bn: 'বাংলা', en: 'English' })[l] ?? l;
</script>

<p class="mb-4 text-sm text-muted-foreground">{t('audienceNote')}</p>
<div class="grid gap-4 lg:grid-cols-2">
	<Card title={t('countries')}><BarList items={a.countries} name={(c) => countryName(c, locale)} percent /></Card>
	<Card title={t('pages')}><BarList items={a.pages} /></Card>
	<Card title={t('devices')}><Donut items={a.devices} name={device} /></Card>
	<Card title={t('languages')}><Donut items={a.languages} name={language} /></Card>
	<Card title={t('browsers')}><BarList items={a.browsers} percent /></Card>
	<Card title={t('systems')}><BarList items={a.systems} percent /></Card>
	<Card title={t('referrers')} class="lg:col-span-2"><BarList items={a.referrers} /></Card>
</div>
