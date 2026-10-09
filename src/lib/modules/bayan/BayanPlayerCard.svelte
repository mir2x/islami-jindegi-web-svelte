<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import Clock from '@lucide/svelte/icons/clock';
	import Download from '@lucide/svelte/icons/download';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Mic from '@lucide/svelte/icons/mic';
	import AudioPlayer from '#lib/components/media/AudioPlayer.svelte';
	import CategoryChips from '#lib/components/shared/CategoryChips.svelte';
	import { formatClock } from '#lib/audio.ts';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BayanListItem } from '#lib/types.ts';
	import { buildDownloadFilename, downloadUrl } from '#lib/utils.ts';

	let { bayan, class: className }: { bayan: BayanListItem; class?: string } = $props();
	const t = useT('BayanDetail');
	const locale = $derived(currentLocale());
	let duration = $state(0);

	const fact = 'flex items-start gap-2';
</script>

<div class={className}>
	<CategoryChips categories={bayan.categories} class="mb-4" small />
	<h1 class="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-1">{bayan.title}</h1>
	<div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
		<div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Mic class="w-3.5 h-3.5" /></div>
		<span class="font-medium text-foreground">{bayan.author.name}</span>
	</div>

	{#if bayan.excerpt}
		<p class="text-sm leading-relaxed mt-3"><span class="font-semibold text-foreground">{t('topics')}: </span><span class="text-foreground/70">{bayan.excerpt}</span></p>
	{/if}

	{#if bayan.audioUrl}
		<div class="mt-7"><AudioPlayer src={bayan.audioUrl} ns="BayanDetail" meta={false} latinDigits bind:duration /></div>
	{:else}
		<p class="text-sm text-muted-foreground mt-7">{t('noAudio')}</p>
	{/if}

	<div class="mt-7 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
		{#if bayan.location}
			<div class={fact}>
				<MapPin class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
				<div>
					<p class="text-xs text-muted-foreground">{t('location')}</p>
					<p class="text-foreground font-medium">{bayan.location}</p>
				</div>
			</div>
		{/if}
		<div class={fact}>
			<Calendar class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
			<div>
				<p class="text-xs text-muted-foreground">{t('date')}</p>
				<p class="text-foreground font-medium">{formatDate(bayan.publishedAt, locale)}</p>
			</div>
		</div>
		{#if duration > 0}
			<div class={fact}>
				<Clock class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
				<div>
					<p class="text-xs text-muted-foreground">{t('audioDuration')}</p>
					<p class="text-foreground font-medium">{formatClock(duration, 'en')}</p>
				</div>
			</div>
		{/if}
	</div>

	{#if bayan.audioUrl}
		<a
			download
			href={downloadUrl(bayan.audioUrl, buildDownloadFilename(bayan.title, bayan.author.name, bayan.audioUrl))}
			class="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors print:hidden"
		>
			<Download class="w-4 h-4" />{t('download')}
		</a>
	{/if}
</div>
