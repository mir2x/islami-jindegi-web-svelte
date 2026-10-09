<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Clock from '@lucide/svelte/icons/clock';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Send from '@lucide/svelte/icons/send';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { goto } from '$app/navigation';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { PushNotificationDetail, SavePushNotificationRequest } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import { Draft, EDITABLE } from './draft.svelte.ts';
	import Preview from './Preview.svelte';
	import Sections from './Sections.svelte';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		/** The saved notification being edited. */
		notification?: PushNotificationDetail | null;
		/** Prefills a new notification from an existing one ("Duplicate"). */
		template?: PushNotificationDetail | null;
	}
	let { notification = null, template = null }: Props = $props();

	const BASE = '/api/admin/notifications';
	const t = useT('Notifications');
	// svelte-ignore state_referenced_locally
	const d = new Draft(notification, template);
	// svelte-ignore state_referenced_locally
	const readOnly = !!notification && !EDITABLE.includes(notification.status);
	// Id of the saved row: set after the first save, so a retry after a failed send updates the same draft.
	// svelte-ignore state_referenced_locally
	let savedId = $state<string | null>(notification?.id ?? null);
	let confirming = $state(false);
	let working = $state<null | 'draft' | 'test' | 'submit'>(null);

	const dateFormat = $derived(new Intl.DateTimeFormat(currentLocale(), { dateStyle: 'medium', timeStyle: 'short' }));
	const back = () => goto(localePath('/admin/notifications'));
	const fail = (err: unknown, fallback: string) => toast.error(err instanceof ApiError && err.message ? err.message : fallback);
	const sendLabel = $derived(d.when === 'later' ? t('schedule') : d.sendPush ? t('sendNow') : t('publishNow'));

	/** Validated payload, or null after toasting why not. */
	function payload(): SavePushNotificationRequest | null {
		const r = d.build(t);
		if ('error' in r) {
			toast.error(r.error);
			return null;
		}
		return r.payload;
	}

	async function persist(p: SavePushNotificationRequest) {
		const saved = savedId ? await api.put<PushNotificationDetail>(`${BASE}/${savedId}`, p) : await api.post<PushNotificationDetail>(BASE, p);
		savedId = saved.id;
		return saved;
	}

	async function saveDraft() {
		const p = payload();
		if (!p) return;
		working = 'draft';
		try {
			await persist(p);
			toast.success(t('saved'));
			await back();
		} catch (err) {
			fail(err, t('saveFailed'));
		} finally {
			working = null;
		}
	}

	async function runTest() {
		const p = payload();
		if (!p) return;
		working = 'test';
		try {
			await api.post(`${BASE}/test`, p);
			toast.success(t('testSent'));
		} catch (err) {
			fail(err, t('testFailed'));
		} finally {
			working = null;
		}
	}

	function askConfirm() {
		if (!payload()) return;
		if (d.when === 'later') {
			const s = d.scheduledIso(t);
			if ('error' in s) return toast.error(s.error);
		}
		confirming = true;
	}

	async function submit() {
		const p = payload();
		if (!p) return;
		let at: string | null = null;
		if (d.when === 'later') {
			const s = d.scheduledIso(t);
			if ('error' in s) return toast.error(s.error);
			at = s.iso;
		}
		working = 'submit';
		try {
			const saved = await persist(p);
			if (at) {
				await api.post(`${BASE}/${saved.id}/schedule`, { scheduledAt: at });
				toast.success(t('scheduledToast', { date: dateFormat.format(new Date(at)) }));
			} else {
				const result = await api.post<PushNotificationDetail>(`${BASE}/${saved.id}/send`);
				if (result.status === 'failed') {
					// Saved and claimed, but FCM refused it; the row keeps the error for a retry.
					toast.error(t('sendFailedWith', { error: result.error ?? '' }));
					confirming = false;
					return;
				}
				toast.success(d.sendPush ? t('sentToast') : t('publishedToast'));
			}
			confirming = false;
			await back();
		} catch (err) {
			fail(err, t('sendFailed'));
		} finally {
			working = null;
		}
	}

	const confirmTitle = $derived(
		d.when === 'later'
			? t('confirmScheduleTitle', { date: d.scheduledLocal ? dateFormat.format(new Date(d.scheduledLocal)) : '' })
			: d.sendPush
				? t('confirmSendTitle', { audience: t(`audience.${d.target}`) })
				: t('confirmPublishTitle')
	);
</script>

<div class="w-full p-6 lg:p-8">
	<div class="flex flex-wrap items-center justify-between gap-3 mb-4">
		<button type="button" onclick={back} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			><ArrowLeft class="w-4 h-4" /> {t('backToList')}</button
		>
		{#if notification}<StatusBadge status={notification.status} />{/if}
	</div>

	<h1 class="text-2xl font-bold tracking-tight mb-6">{readOnly ? t('viewTitle') : notification ? t('editTitle') : t('newTitle')}</h1>

	{#if readOnly}
		<div class="mb-6 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
			{notification?.sentAt ? t('readOnlySent', { date: dateFormat.format(new Date(notification.sentAt)) }) : t('readOnlySending')}
		</div>
	{/if}
	{#if notification?.status === 'failed' && notification.error}
		<div class="mb-6 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
			<TriangleAlert class="w-4 h-4 mt-0.5 shrink-0" /><span>{t('lastError', { error: notification.error })}</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
		<fieldset disabled={readOnly} class="space-y-4 min-w-0">
			<Sections {d} {notification} {readOnly} />

			{#if !readOnly}
				<div class="flex flex-wrap gap-3 pt-2">
					<Button onclick={askConfirm} disabled={!!working} class="gap-2 sm:px-6">
						{#if d.when === 'later'}<Clock class="w-4 h-4" />{:else}<Send class="w-4 h-4" />{/if}
						{sendLabel}
					</Button>
					<Button variant="outline" onclick={saveDraft} disabled={!!working}
						>{working === 'draft' ? t('saving') : notification?.status === 'scheduled' ? t('saveChanges') : t('saveDraft')}</Button
					>
					<Button variant="outline" onclick={runTest} disabled={!!working} class="gap-2"
						><FlaskConical class="w-4 h-4" /> {working === 'test' ? t('sendingTest') : t('sendTest')}</Button
					>
				</div>
			{/if}
		</fieldset>

		<div class="lg:sticky lg:top-6">
			<Preview title={d.title} body={d.body} imageUrl={d.imageUrl} sendPush={d.sendPush} showInInbox={d.showInInbox} />
			{#if !readOnly}<p class="mt-3 text-xs text-muted-foreground">{t('testHint')}</p>{/if}
		</div>
	</div>

	<ConfirmDialog
		open={confirming}
		title={confirmTitle}
		busy={working === 'submit'}
		primary
		confirmLabel={sendLabel}
		busyLabel={t('working')}
		onconfirm={submit}
		oncancel={() => !working && (confirming = false)}
	>
		{d.sendPush ? t('confirmSendDescription') : t('confirmPublishDescription')}
	</ConfirmDialog>
</div>
