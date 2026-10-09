<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Repeat from '@lucide/svelte/icons/repeat';
	import SkipBack from '@lucide/svelte/icons/skip-back';
	import SkipForward from '@lucide/svelte/icons/skip-forward';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import X from '@lucide/svelte/icons/x';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import type { SurahAudio } from './surah-audio.svelte.ts';

	interface Props {
		audio: SurahAudio;
		surahName: string;
		totalAyahs: number;
		onrange: () => void;
	}
	let { audio, surahName, totalAyahs, onrange }: Props = $props();

	const t = useT('SurahReader');
	const n = useNum();
	const range = $derived(audio.range);
	const step = 'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors';
</script>

<!-- Pinned to the bottom while an audio session is active. -->
{#if audio.visible && audio.activeAyah !== null}
	{@const current = audio.activeAyah}
	<div class="shrink-0 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
		{#if range && (range.end > range.start || range.repeatsLeft > 1)}
			<div class="max-w-2xl mx-auto mb-2 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-xs">
				<span class="text-primary font-medium">{t('rangeRepeating', { start: n(range.start), end: n(range.end), left: n(range.repeatsLeft) })}</span>
				<button type="button" onclick={audio.stopRange} class="text-muted-foreground hover:text-foreground transition-colors">{t('stop')}</button>
			</div>
		{/if}
		<div class="max-w-2xl mx-auto flex items-center gap-3">
			<div class="flex-1 min-w-0">
				<p class="text-sm text-muted-foreground truncate">{t('surahAyah', { surahName, ayahNumber: n(current) })}</p>
				{#if audio.error}<p class="text-xs text-destructive">{t('audioError')}</p>{/if}
			</div>
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={onrange}
					title={t('rangeAndRepeat')}
					aria-label={t('rangeAndRepeat')}
					class={cn('p-2 rounded-lg transition-colors', range ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
					><Repeat class="w-4 h-4" /></button
				>
				<button type="button" onclick={audio.skipBack} disabled={current <= 1} aria-label="Previous" class={step}><SkipBack class="w-4 h-4" /></button>
				<button
					type="button"
					onclick={audio.toggle}
					disabled={audio.loading}
					aria-label={audio.playing ? 'Pause' : 'Play'}
					class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
				>
					{#if audio.loading}<Loader2 class="w-4 h-4 animate-spin" />{:else if audio.playing}<Pause class="w-4 h-4" />{:else}<Play class="w-4 h-4 ml-0.5" />{/if}
				</button>
				<button type="button" onclick={audio.skipForward} disabled={current >= totalAyahs} aria-label="Next" class={step}><SkipForward class="w-4 h-4" /></button>
			</div>
			<div class="flex items-center gap-1">
				<Volume2 class="w-4 h-4 text-muted-foreground" />
				<button
					type="button"
					onclick={audio.stop}
					title={t('stop')}
					aria-label={t('stop')}
					class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X class="w-4 h-4" /></button
				>
			</div>
		</div>
	</div>
{/if}
