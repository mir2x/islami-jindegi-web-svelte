<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import CloudDownload from '@lucide/svelte/icons/cloud-download';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { onMount } from 'svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import AudienceTab from '#lib/admin/insights/AudienceTab.svelte';
	import { clock } from '#lib/admin/insights/format.ts';
	import HealthTab from '#lib/admin/insights/HealthTab.svelte';
	import { InsightsState } from '#lib/admin/insights/insights.svelte.ts';
	import OverviewTab from '#lib/admin/insights/OverviewTab.svelte';
	import TechnicalTab from '#lib/admin/insights/TechnicalTab.svelte';
	import type { RangeId } from '#lib/admin/insights/types.ts';
	import Skeleton from '#lib/admin/ui/Skeleton.svelte';
	import Tabs from '#lib/admin/ui/Tabs.svelte';
	import { StoredValue } from '#lib/storage/stored.svelte.ts';

	const t = useT('Insights');
	const offline = useT('OfflineSync');
	const locale = $derived(currentLocale());
	const state = new InsightsState();
	// Remembers the last tab and range between visits.
	const tabPref = new StoredValue('ij-admin-insights-tab', 'overview', { bare: true });
	const tab = $derived(tabPref.current ?? 'overview');

	const tabs = $derived([
		{ id: 'overview', label: t('tabOverview') },
		{ id: 'audience', label: t('tabAudience') },
		{ id: 'health', label: t('tabHealth') },
		{ id: 'technical', label: t('tabTechnical') }
	]);
	const ranges = $derived([
		{ id: '7d', label: t('range7d') },
		{ id: '30d', label: t('range30d') }
	]);
	onMount(() => void state.load());
</script>

<div class="mx-auto max-w-7xl p-4 sm:p-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{t('title')}</h1>
			<p class="mt-1 text-muted-foreground">{t('subtitle')}</p>
		</div>
		<div class="flex items-center gap-2">
			<Tabs tabs={ranges} value={state.range} onchange={(id) => void state.load(id as RangeId)} />
			<button
				type="button"
				onclick={() => void state.load()}
				class="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-foreground"
				aria-label={t('refresh')}
				title={state.data ? t('updated', { time: clock(state.data.generatedAt, locale) }) : t('refresh')}
			>
				<RefreshCw class={state.loading ? 'size-4 animate-spin' : 'size-4'} />
			</button>
		</div>
	</div>

	<Tabs {tabs} value={tab} onchange={(id) => tabPref.set(id)} class="mt-6 max-w-full overflow-x-auto" />

	<div class="mt-4">
		{#if state.error === 'not-configured' || state.error === 'unavailable'}
			<div class="rounded-xl border bg-card p-8 text-center">
				<p class="font-medium">{state.error === 'not-configured' ? t('notConfigured') : t('unavailable')}</p>
				<button type="button" class="mt-3 text-sm text-primary underline-offset-4 hover:underline" onclick={() => void state.load()}>{t('retry')}</button>
			</div>
		{:else if state.data}
			<div class={state.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
				{#if tab === 'overview'}<OverviewTab data={state.data} />
				{:else if tab === 'audience'}<AudienceTab data={state.data} />
				{:else if tab === 'health'}<HealthTab data={state.data} />
				{:else}<TechnicalTab data={state.data} />{/if}
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{#each [0, 1, 2, 3] as i (i)}<Skeleton class="h-40 rounded-xl" />{/each}
			</div>
			<Skeleton class="mt-4 h-64 rounded-xl" />
		{/if}
	</div>

	<a href={localePath('/admin/offline-sync')} class="group mt-8 flex items-start gap-4 rounded-xl border bg-card p-5 transition-colors hover:bg-muted/40 sm:max-w-md">
		<CloudDownload class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
		<div class="min-w-0 flex-1">
			<p class="font-semibold">{offline('dashboardCardTitle')}</p>
			<p class="mt-1 text-sm text-muted-foreground">{offline('dashboardCardDescription')}</p>
		</div>
		<ChevronRight class="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
	</a>
</div>
