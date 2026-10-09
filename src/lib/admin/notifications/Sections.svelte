<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { NotificationTarget, PushNotificationDetail } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import MediaField from '../media/MediaField.svelte';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import CheckOption from '../ui/CheckOption.svelte';
	import ChoiceGroup from '../ui/ChoiceGroup.svelte';
	import { inputCls, sectionTitleCls, textareaCls, inp } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import Select from '../ui/Select.svelte';
	import DeepLinkPicker from './DeepLinkPicker.svelte';
	import { BODY_MAX, EXPIRY_DAYS, TITLE_MAX, type Draft, type Expiry } from './draft.svelte.ts';

	interface Props {
		d: Draft;
		/** The saved row being edited, for the "keep current expiry" option. */
		notification: PushNotificationDetail | null;
		readOnly: boolean;
	}
	let { d, notification, readOnly }: Props = $props();

	const t = useT('Notifications');
	const dateFormat = $derived(new Intl.DateTimeFormat(currentLocale(), { dateStyle: 'medium', timeStyle: 'short' }));
	const expiryLabel = (v: string) =>
		v === 'none'
			? t('expiryNone')
			: v === 'keep'
				? t('expiryKeep', { date: notification?.expiresAt ? dateFormat.format(new Date(notification.expiresAt)) : '' })
				: t('expiryDays', { days: Number(v) });
	const expiryOptions = $derived([
		{ value: 'none', label: expiryLabel('none') },
		...(notification?.expiresAt ? [{ value: 'keep', label: expiryLabel('keep') }] : []),
		...EXPIRY_DAYS.map((v) => ({ value: v as string, label: expiryLabel(v) }))
	]);
</script>

<Card variant="roomy" title={t('sectionContent')}>
	<Field label={t('fieldTitle')} required aside="{d.title.length}/{TITLE_MAX}">
		<input bind:value={d.title} maxlength={TITLE_MAX} placeholder={t('titlePlaceholder')} class={inputCls} />
	</Field>
	<Field label={t('fieldBody')} required aside="{d.body.length}/{BODY_MAX}">
		<textarea bind:value={d.body} maxlength={BODY_MAX} rows="4" placeholder={t('bodyPlaceholder')} class={textareaCls}></textarea>
	</Field>
	<Field label={t('fieldImage')} hint={t('imageHint')}><MediaField bind:value={d.imageUrl} accept="image" /></Field>
</Card>

<Card variant="roomy" title={t('sectionAction')}>
	<ChoiceGroup
		options={[
			{ value: 'none', label: t('link.none') },
			{ value: 'screen', label: t('link.screen') },
			{ value: 'url', label: t('link.url') }
		]}
		value={d.linkType}
		onchange={(v) => (d.linkType = v)}
	/>
	{#if d.linkType === 'screen'}<DeepLinkPicker value={d.screen} onchange={(p) => (d.screen = p)} disabled={readOnly} />{/if}
	{#if d.linkType === 'url'}<input bind:value={d.url} placeholder="https://" type="url" class={inputCls} />{/if}
</Card>

<Card variant="roomy" title={t('sectionDelivery')}>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<Field label={t('fieldAudience')}>
			<Select bind:value={d.target} options={(['all', 'android', 'ios'] as NotificationTarget[]).map((v) => ({ value: v, label: t(`audience.${v}`) }))} />
			{#if d.target !== 'all'}<p class="text-xs text-muted-foreground">{t('platformHint')}</p>{/if}
		</Field>
		<Field label={t('fieldExpiry')}>
			<Select value={d.expiry} onchange={(v) => (d.expiry = v as Expiry)} options={expiryOptions} />
			<p class="text-xs text-muted-foreground">{t('expiryHint')}</p>
		</Field>
	</div>
	<div class="space-y-2.5">
		<CheckOption bind:checked={d.sendPush} label={t('fieldSendPush')} hint={t('sendPushHint')} />
		<CheckOption bind:checked={d.showInInbox} label={t('fieldShowInInbox')} hint={t('showInInboxHint')} />
	</div>
	<Field label={t('fieldWhen')}>
		<ChoiceGroup
			class="max-w-sm"
			options={[
				{ value: 'now', label: t('when.now') },
				{ value: 'later', label: t('when.later') }
			]}
			value={d.when}
			onchange={(v) => (d.when = v)}
		/>
		{#if d.when === 'later'}<input type="datetime-local" bind:value={d.scheduledLocal} class={inp('max-w-sm mt-2')} />{/if}
	</Field>
</Card>

<div class="bg-card border rounded-xl">
	<button type="button" onclick={() => (d.advancedOpen = !d.advancedOpen)} class="w-full flex items-center justify-between p-5">
		<span class={sectionTitleCls}>{t('sectionAdvanced')}</span>
		<ChevronDown class={cn('w-4 h-4 text-muted-foreground transition-transform', d.advancedOpen && 'rotate-180')} />
	</button>
	{#if d.advancedOpen}
		<div class="px-5 pb-5 space-y-4">
			<CheckOption bind:checked={d.highPriority} label={t('fieldHighPriority')} hint={t('highPriorityHint')} />
			<CheckOption bind:checked={d.sound} label={t('fieldSound')} hint={t('soundHint')} />
			<Field label={t('fieldAnalyticsLabel')} class="max-w-sm">
				<input bind:value={d.analyticsLabel} maxlength={50} placeholder="ramadan-2027" class={inp('font-mono text-sm')} />
				<p class="text-xs text-muted-foreground">{t('analyticsLabelHint')}</p>
			</Field>
			<Field label={t('fieldCustomData')}>
				<p class="text-xs text-muted-foreground">{t('customDataHint')}</p>
				{#each d.dataRows as row, i (i)}
					<div class="flex gap-2">
						<input bind:value={row.key} placeholder={t('dataKey')} class={inp('font-mono text-sm')} />
						<input bind:value={row.value} placeholder={t('dataValue')} class={inp('font-mono text-sm')} />
						<Button variant="ghost" size="icon" aria-label="Remove" class="shrink-0 text-muted-foreground hover:text-destructive" onclick={() => d.dataRows.splice(i, 1)}
							><Trash2 class="w-4 h-4" /></Button
						>
					</div>
				{/each}
				<Button variant="outline" size="sm" class="gap-1.5" onclick={() => d.dataRows.push({ key: '', value: '' })}><Plus class="w-3.5 h-3.5" /> {t('addData')}</Button>
			</Field>
		</div>
	{/if}
</div>
