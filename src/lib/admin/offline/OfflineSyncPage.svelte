<script lang="ts">
	import CloudDownload from '@lucide/svelte/icons/cloud-download';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Send from '@lucide/svelte/icons/send';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { onMount } from 'svelte';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { OfflineFeatureStatus } from '#lib/types.ts';
	import { api } from '../api.ts';
	import DataTable from '../list/DataTable.svelte';
	import { toast } from '../toast.svelte.ts';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import { formatSize, minutesUntilPush } from './sync.ts';

	const REFRESH_MS = 30_000;
	const t = useT('OfflineSync');
	const tc = useT('Common');
	const locale = $derived(currentLocale());

	let features = $state<OfflineFeatureStatus[] | null>(null);
	let now = $state(Date.now());
	let pending = $state<{ kind: 'rebuild' | 'push'; feature: string } | null>(null);
	let working = $state(false);

	async function load() {
		now = Date.now();
		try {
			features = await api.get<OfflineFeatureStatus[]>('/api/admin/offline/status');
		} catch {
			toast.error(t('loadFailed'));
		}
	}
	onMount(() => {
		void load();
		const timer = setInterval(load, REFRESH_MS);
		return () => clearInterval(timer);
	});

	const dateFormat = $derived(new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }));
	const formatDate = (iso: string) => dateFormat.format(new Date(iso));
	const featureLabel = (feature: string) => (typeof t.raw(`features.${feature}`) === 'string' ? t(`features.${feature}`) : feature);
	const pendingLabel = $derived(pending ? (pending.feature === 'all' ? t('allFeatures') : featureLabel(pending.feature)) : '');

	async function confirm() {
		if (!pending) return;
		const { kind, feature } = pending;
		working = true;
		try {
			if (kind === 'rebuild') {
				await api.post(`/api/admin/offline/snapshots/${feature}/rebuild`);
				toast.success(t('rebuildQueued'));
			} else {
				await api.post(`/api/admin/offline/push/${feature}`);
				toast.success(t('pushSent'));
				await load();
			}
			pending = null;
		} catch {
			toast.error(kind === 'rebuild' ? t('rebuildFailed') : t('pushFailed'));
		} finally {
			working = false;
		}
	}
</script>

<div class="min-h-full flex flex-col">
	<div class="shrink-0 px-4 sm:px-8 pt-8 pb-4 bg-background">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">{t('title')}</h1>
				<p class="mt-1 text-sm text-muted-foreground max-w-2xl">{t('description')}</p>
			</div>
			<Button variant="outline" class="gap-2 shadow-sm" onclick={() => (pending = { kind: 'rebuild', feature: 'all' })}><RefreshCw class="w-4 h-4" /> {t('rebuildAll')}</Button>
		</div>
	</div>

	<div class="flex-1 px-4 sm:px-8 pb-6">
		<DataTable fixed={false} widths={['', '', '', '', '', '']} minWidth="min-w-[900px]">
			{#snippet head()}
				{#each [t('colFeature'), t('colLastChange'), t('colPush'), t('colSnapshot'), t('colTombstones')] as label (label)}
					<th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</th>
				{/each}
				<th class="px-5 py-3.5"></th>
			{/snippet}
			{#if !features}
				{#each { length: 8 } as _, i (i)}<tr
						>{#each { length: 6 } as _, j (j)}<td class="px-5 py-4"><Skeleton class="h-4 w-28" /></td>{/each}</tr
					>{/each}
			{:else}
				{#each features as s (s.feature)}
					{@const minutes = minutesUntilPush(s, now)}
					<tr class="hover:bg-muted/40 transition-colors">
						<td class="px-5 py-4">
							<p class="font-medium">{featureLabel(s.feature)}</p>
							<p class="text-xs text-muted-foreground">{t('schemaVersion', { version: s.schemaVersion })}</p>
						</td>
						<td class="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(s.lastChangedAt)}</td>
						<td class="px-5 py-4 text-sm">
							{#if minutes !== null}
								<Badge variant="secondary">{minutes === 0 ? t('pushDueNow') : t('pushPending', { minutes })}</Badge>
							{:else if s.lastPushedAt}
								<span class="text-muted-foreground whitespace-nowrap">{t('lastPushed', { date: formatDate(s.lastPushedAt) })}</span>
							{:else}
								<span class="text-muted-foreground">{t('neverPushed')}</span>
							{/if}
						</td>
						<td class="px-5 py-4 text-sm">
							{#if !s.snapshot}
								<span class="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 text-xs font-medium text-destructive h-5 whitespace-nowrap"
									><TriangleAlert class="w-3 h-3" />{t('noSnapshot')}</span
								>
							{:else}
								<div class="flex flex-col gap-1">
									<a href={s.snapshot.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-primary hover:underline whitespace-nowrap">
										<CloudDownload class="w-3.5 h-3.5" />{t('snapshotSize', { size: formatSize(s.snapshot.size), raw: formatSize(s.snapshot.rawSize) })}
									</a>
									<span class="text-xs text-muted-foreground whitespace-nowrap">{t('snapshotBuilt', { date: formatDate(s.snapshot.generatedAt) })}</span>
									{#if s.snapshot.schemaVersion !== s.schemaVersion}
										<span class="inline-flex w-fit items-center gap-1 rounded-full bg-destructive/10 px-2 text-xs font-medium text-destructive h-5 whitespace-nowrap"
											><TriangleAlert class="w-3 h-3" />{t('rebuildPending')}</span
										>
									{/if}
								</div>
							{/if}
						</td>
						<td class="px-5 py-4 text-sm text-muted-foreground">{s.tombstoneCount.toLocaleString(locale)}</td>
						<td class="px-5 py-4">
							<div class="flex justify-end gap-2">
								<Button size="sm" variant="outline" class="gap-1.5" onclick={() => (pending = { kind: 'rebuild', feature: s.feature })}
									><RefreshCw class="w-3.5 h-3.5" /> {t('rebuild')}</Button
								>
								<Button size="sm" variant="outline" class="gap-1.5" onclick={() => (pending = { kind: 'push', feature: s.feature })}
									><Send class="w-3.5 h-3.5" /> {t('pushNow')}</Button
								>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</DataTable>
		<p class="mt-3 text-xs text-muted-foreground">{t('autoRefresh')}</p>
	</div>

	<ConfirmDialog
		open={!!pending}
		title={pending?.kind === 'push' ? t('confirmPushTitle', { feature: pendingLabel }) : t('confirmRebuildTitle', { feature: pendingLabel })}
		busy={working}
		primary
		confirmLabel={pending?.kind === 'push' ? t('pushNow') : t('rebuild')}
		busyLabel={t('working')}
		onconfirm={confirm}
		oncancel={() => (pending = null)}
	>
		{pending?.kind === 'push' ? t('confirmPushDescription') : t('confirmRebuildDescription')}
	</ConfirmDialog>
</div>
