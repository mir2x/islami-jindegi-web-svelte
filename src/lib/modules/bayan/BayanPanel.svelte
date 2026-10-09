<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import AudioPlayer from '#lib/components/media/AudioPlayer.svelte';
	import CategoryChips from '#lib/components/shared/CategoryChips.svelte';
	import { formatFileSize } from '#lib/audio.ts';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BayanListItem } from '#lib/types.ts';
	import { buildDownloadFilename, downloadUrl } from '#lib/utils.ts';

	/** Body of the bayan side panel: topics, player, facts and download. Keyed by bayan, so duration/size reset. */
	let { d }: { d: BayanListItem } = $props();

	const t = useT('BayanPage');
	const locale = $derived(currentLocale());
	let duration = $state(0);
	let size = $state<number | null>(null);

	const row = 'flex items-center gap-3';
	const label = 'w-28 shrink-0 text-muted-foreground';
	const value = 'font-medium text-foreground';
</script>

{#if d.excerpt}
	<p class="text-base leading-relaxed mb-6"><span class="font-semibold text-foreground">{t('topics')}: </span><span class="text-foreground/70">{d.excerpt}</span></p>
{/if}

{#if d.audioUrl}<AudioPlayer src={d.audioUrl} ns="BayanPage" meta={false} bind:duration bind:size />{/if}

<div class="mt-6 space-y-2 text-sm">
	{#if d.location}<div class={row}><span class={label}>{t('location')}:</span><span class={value}>{d.location}</span></div>{/if}
	<div class={row}><span class={label}>{t('date')}:</span><span class={value}>{formatDate(d.publishedAt, locale, { order: 'month-first' })}</span></div>
	{#if duration > 0}
		<div class={row}><span class={label}>{t('audioDuration')}:</span><span class={value}>{t('audioDurationValue', { minutes: Math.max(1, Math.round(duration / 60)) })}</span></div>
	{/if}
	{#if size != null}<div class={row}><span class={label}>{t('audioSize')}:</span><span class={value}>{formatFileSize(size, locale)}</span></div>{/if}
</div>

{#if d.audioUrl}
	<a
		download
		href={downloadUrl(d.audioUrl, buildDownloadFilename(d.title, d.author.name, d.audioUrl))}
		class="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-base font-medium text-foreground hover:bg-muted transition-colors print:hidden"
	>
		<Download class="w-4 h-4" />{t('download')}
	</a>
{/if}
<CategoryChips categories={d.categories} class="mt-4" />
