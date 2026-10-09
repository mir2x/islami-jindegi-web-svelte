<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Search from '@lucide/svelte/icons/search';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import XCircle from '@lucide/svelte/icons/circle-x';
	import { onMount } from 'svelte';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { NotificationStatus, PushNotificationListItem } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { recall, remember } from '../content/list-memory.ts';
	import DataTable from '../list/DataTable.svelte';
	import ListPage from '../list/ListPage.svelte';
	import { PagedLoader } from '../list/loader.svelte.ts';
	import TableEmpty from '../list/TableEmpty.svelte';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Select from '../ui/Select.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import StatusBadge from './StatusBadge.svelte';

	const PAGE_SIZE = 20;
	// Scheduled sends go out from a once-a-minute worker, so refresh while the page is open.
	const REFRESH_MS = 30_000;
	const STATUSES: NotificationStatus[] = ['draft', 'scheduled', 'sending', 'sent', 'failed'];
	const BASE = '/api/admin/notifications';

	const t = useT('Notifications');
	const tc = useT('Common');
	// Search text and the status filter reuse the shared list memory (`published` carries the status).
	let s = $state(recall('notifications', 'createdAt_desc'));
	const loader = new PagedLoader<PushNotificationListItem>(BASE);
	let pending = $state<{ kind: 'delete' | 'cancel'; item: PushNotificationListItem } | null>(null);
	let working = $state(false);
	let configured = $state(true);
	let timer: ReturnType<typeof setTimeout>;

	const result = $derived(loader.result);
	const dateFormat = $derived(new Intl.DateTimeFormat(currentLocale(), { dateStyle: 'medium', timeStyle: 'short' }));
	const formatDate = (iso: string) => dateFormat.format(new Date(iso));
	const load = () => loader.load({ page: s.page, pageSize: PAGE_SIZE, search: s.search, status: s.published });

	$effect(() => {
		remember('notifications', { ...s });
		load();
	});
	onMount(() => {
		const id = setInterval(load, REFRESH_MS);
		// The banner is only a hint, so a failure stays silent.
		api
			.get<{ pushConfigured: boolean }>(`${BASE}/status`)
			.then((r) => (configured = r.pushConfigured))
			.catch(() => {});
		return () => clearInterval(id);
	});

	const timeLabel = (item: PushNotificationListItem) =>
		item.sentAt
			? t('timeSent', { date: formatDate(item.sentAt) })
			: item.status === 'scheduled' && item.scheduledAt
				? t('timeScheduled', { date: formatDate(item.scheduledAt) })
				: t('timeUpdated', { date: formatDate(item.updatedAt) });

	async function confirm() {
		if (!pending) return;
		working = true;
		try {
			if (pending.kind === 'delete') {
				await api.delete(`${BASE}/${pending.item.id}`);
				toast.success(t('deleted'));
			} else {
				await api.post(`${BASE}/${pending.item.id}/cancel`);
				toast.success(t('cancelled'));
			}
			pending = null;
			load();
		} catch (err) {
			toast.error(err instanceof ApiError && err.message ? err.message : tc('somethingWentWrong'));
		} finally {
			working = false;
		}
	}

	const btn = 'h-8 w-8 text-muted-foreground hover:text-foreground';
</script>

<ListPage
	title={t('title')}
	total={null}
	subtitle={t('description')}
	addHref="/admin/notifications/new"
	addLabel={t('new')}
	page={s.page}
	totalPages={loader.totalPages}
	onpage={(p) => (s.page = p)}
>
	{#snippet filters()}
		<div class="relative flex-1 min-w-56 max-w-sm">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<input
				placeholder={t('searchPlaceholder')}
				value={s.search}
				oninput={(e) => {
					const v = e.currentTarget.value;
					clearTimeout(timer);
					timer = setTimeout(() => Object.assign(s, { search: v, page: 1 }), 250);
				}}
				class={inp('pl-9 bg-card')}
			/>
		</div>
		<Select
			class="w-40"
			filter
			value={s.published}
			onchange={(v) => Object.assign(s, { published: v, page: 1 })}
			options={[{ value: '', label: t('allStatuses') }, ...STATUSES.map((v) => ({ value: v, label: t(`status.${v}`) }))]}
		/>
	{/snippet}

	{#snippet notice()}
		{#if !configured}
			<div class="mb-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
				<TriangleAlert class="w-4 h-4 mt-0.5 shrink-0" /><span>{t('pushNotConfigured')}</span>
			</div>
		{/if}
	{/snippet}

	<DataTable widths={['', 'w-32', 'w-28', 'w-32', 'w-52', 'w-36']} minWidth="min-w-[880px]">
		{#snippet head()}
			{#each [t('colNotification'), t('colAudience'), t('colDelivery'), t('colStatus'), t('colTime')] as label (label)}
				<th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</th>
			{/each}
			<th class="px-5 py-3.5"></th>
		{/snippet}

		{#if loader.loading && !result}
			{#each { length: 8 } as _, i (i)}
				<tr>
					<td class="px-5 py-4"><Skeleton class="h-4 w-56" /><Skeleton class="h-3 w-72 mt-2" /></td><td class="px-5 py-4"><Skeleton class="h-4 w-16" /></td><td class="px-5 py-4"
						><Skeleton class="h-4 w-12" /></td
					>
					<td class="px-5 py-4"><Skeleton class="h-5 w-20 rounded-full" /></td><td class="px-5 py-4"><Skeleton class="h-4 w-32" /></td><td class="px-5 py-4"></td>
				</tr>
			{/each}
		{:else if result && result.data.length === 0}
			<TableEmpty colspan={6} icon="bell" title={t('empty')} hint={s.search || s.published ? t('emptyFiltered') : t('emptyHint')} />
		{:else if result}
			{#each result.data as item (item.id)}
				<tr class="hover:bg-muted/30 transition-colors group cursor-pointer" onclick={(e) => adminNavigate(`/admin/notifications/${item.id}/edit`, e)}>
					<td class="px-5 py-4">
						<p class="font-semibold leading-snug truncate">{item.title}</p>
						<p class="text-sm text-muted-foreground line-clamp-1 mt-0.5">{item.body}</p>
						{#if item.status === 'failed' && item.error}<p class="text-xs text-destructive line-clamp-1 mt-1">{item.error}</p>{/if}
					</td>
					<td class="px-5 py-4 text-sm text-muted-foreground">{t(`audience.${item.target}`)}</td>
					<td class="px-5 py-4">
						<div class="flex gap-2 text-muted-foreground">
							{#if item.sendPush}<span title={t('deliveryPush')}><Smartphone class="w-4 h-4" /></span>{/if}
							{#if item.showInInbox}<span title={t('deliveryInbox')}><Inbox class="w-4 h-4" /></span>{/if}
						</div>
					</td>
					<td class="px-5 py-4"><StatusBadge status={item.status} /></td>
					<td class="px-5 py-4 text-sm text-muted-foreground">{timeLabel(item)}</td>
					<td class="px-5 py-4">
						<div class="flex items-center gap-1 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
							{#if ['draft', 'scheduled', 'failed'].includes(item.status)}
								<Button
									variant="ghost"
									size="icon"
									title={tc('edit')}
									aria-label={tc('edit')}
									class={btn}
									onclick={(e) => {
										e.stopPropagation();
										adminNavigate(`/admin/notifications/${item.id}/edit`, e);
									}}><Pencil class="w-3.5 h-3.5" /></Button
								>
							{/if}
							<Button
								variant="ghost"
								size="icon"
								title={t('duplicate')}
								aria-label={t('duplicate')}
								class={btn}
								onclick={(e) => {
									e.stopPropagation();
									adminNavigate(`/admin/notifications/new?from=${item.id}`, e);
								}}><Copy class="w-3.5 h-3.5" /></Button
							>
							{#if item.status === 'scheduled'}
								<Button
									variant="ghost"
									size="icon"
									title={t('cancelSchedule')}
									aria-label={t('cancelSchedule')}
									class={btn}
									onclick={(e) => {
										e.stopPropagation();
										pending = { kind: 'cancel', item };
									}}><XCircle class="w-3.5 h-3.5" /></Button
								>
							{/if}
							{#if item.status !== 'sending'}
								<Button
									variant="ghost"
									size="icon"
									title={tc('delete')}
									aria-label={tc('delete')}
									class="h-8 w-8 text-muted-foreground hover:text-destructive"
									onclick={(e) => {
										e.stopPropagation();
										pending = { kind: 'delete', item };
									}}><Trash2 class="w-3.5 h-3.5" /></Button
								>
							{/if}
						</div>
					</td>
				</tr>
			{/each}
		{/if}
	</DataTable>

	{#snippet after()}
		<ConfirmDialog
			open={!!pending}
			title={pending?.kind === 'delete' ? t('confirmDeleteTitle') : t('confirmCancelTitle')}
			busy={working}
			primary={pending?.kind !== 'delete'}
			confirmLabel={pending?.kind === 'delete' ? tc('delete') : t('cancelSchedule')}
			busyLabel={t('working')}
			onconfirm={confirm}
			oncancel={() => (pending = null)}
		>
			{#if pending?.kind === 'delete'}
				{pending.item.status === 'sent' ? t('confirmDeleteSent', { title: pending.item.title }) : t('confirmDelete', { title: pending.item.title })}
			{:else}
				{t('confirmCancel', { title: pending?.item.title ?? '' })}
			{/if}
		</ConfirmDialog>
	{/snippet}
</ListPage>
