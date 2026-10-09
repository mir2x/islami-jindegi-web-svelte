<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	interface Props {
		title: string;
		body: string;
		imageUrl: string;
		showInInbox: boolean;
		sendPush: boolean;
	}
	let { title, body, imageUrl, showInInbox, sendPush }: Props = $props();

	/** Approximates how the push looks in the Android shade and how the entry looks in the app inbox. */
	const t = useT('Notifications');
	const shownTitle = $derived(title.trim() || t('previewTitlePlaceholder'));
	const shownBody = $derived(body.trim() || t('previewBodyPlaceholder'));
	const label = 'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2';
</script>

<div class="space-y-5">
	{#if sendPush}
		<div>
			<p class={label}>{t('previewPush')}</p>
			<div class="rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-3">
				<div class="rounded-xl bg-white dark:bg-neutral-800 shadow-sm p-3 text-neutral-900 dark:text-neutral-100">
					<div class="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
						<span class="inline-flex w-4 h-4 rounded-full bg-emerald-600 text-white items-center justify-center text-[8px] font-bold">IJ</span>
						<span>Islami Jindegi</span><span>·</span><span>{t('previewNow')}</span>
						<ChevronDown class="w-3 h-3 ml-auto" />
					</div>
					<div class="mt-1.5 flex gap-3">
						<div class="min-w-0 flex-1">
							<p class="text-sm font-semibold leading-snug break-words">{shownTitle}</p>
							<p class="text-[13px] text-neutral-600 dark:text-neutral-300 leading-snug mt-0.5 line-clamp-3 break-words whitespace-pre-line">{shownBody}</p>
						</div>
					</div>
					{#if imageUrl}<img src={imageUrl} alt="" class="mt-2.5 w-full max-h-44 object-cover rounded-lg" />{/if}
				</div>
			</div>
		</div>
	{/if}

	{#if showInInbox}
		<div>
			<p class={label}>{t('previewInbox')}</p>
			<div class="rounded-xl border bg-card p-3 flex gap-3">
				{#if imageUrl}
					<img src={imageUrl} alt="" class="w-12 h-12 rounded-lg object-cover shrink-0" />
				{:else}
					<div class="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Bell class="w-5 h-5" /></div>
				{/if}
				<div class="min-w-0 flex-1">
					<div class="flex items-start gap-2">
						<p class="text-sm font-semibold leading-snug flex-1 break-words">{shownTitle}</p>
						<span class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
					</div>
					<p class="text-[13px] text-muted-foreground leading-snug mt-0.5 line-clamp-3 break-words whitespace-pre-line">{shownBody}</p>
					<p class="text-[11px] text-muted-foreground mt-1">{t('previewJustNow')}</p>
				</div>
			</div>
		</div>
	{/if}
</div>
