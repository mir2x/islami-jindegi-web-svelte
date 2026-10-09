<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Repeat from '@lucide/svelte/icons/repeat';
	import SkipBack from '@lucide/svelte/icons/skip-back';
	import SkipForward from '@lucide/svelte/icons/skip-forward';
	import X from '@lucide/svelte/icons/x';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { AYAH_COUNTS, SURA_NAMES } from './data.ts';
	import type { MushafAudio } from './mushaf-audio.svelte.ts';

	let { audio, onrange }: { audio: MushafAudio; onrange: () => void } = $props();
	const t = useT('MushafReader');
	const n = useNum();
	const step = 'p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors';
</script>

<!-- Visible while a recitation session is active. In the RTL page order, "skip forward" points left. -->
{#if audio.active}
	{@const a = audio.active}
	<div class="flex items-center gap-1 px-2 py-1.5 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-xl">
		<div class="min-w-0 pl-2 pr-1">
			<p class="text-xs font-medium text-foreground truncate max-w-[9rem]">{SURA_NAMES[a.sura - 1]} · {n(a.ayah)}</p>
			{#if audio.error}<p class="text-[10px] text-destructive">{t('audioNotFound')}</p>{/if}
		</div>
		<button
			type="button"
			onclick={onrange}
			title={t('rangeAndRepeat')}
			aria-label={t('rangeAndRepeat')}
			class={cn('p-1.5 rounded-full transition-colors', audio.range ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
			><Repeat class="w-4 h-4" /></button
		>
		<button type="button" onclick={audio.forward} disabled={a.ayah >= AYAH_COUNTS[a.sura - 1]} aria-label="Next ayah" class={step}><SkipBack class="w-4 h-4" /></button>
		<button
			type="button"
			onclick={audio.toggle}
			disabled={audio.loading}
			aria-label={audio.playing ? 'Pause' : 'Play'}
			class="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
		>
			{#if audio.loading}<Loader2 class="w-4 h-4 animate-spin" />{:else if audio.playing}<Pause class="w-4 h-4" />{:else}<Play class="w-4 h-4 ml-0.5" />{/if}
		</button>
		<button type="button" onclick={audio.back} disabled={a.ayah <= 1} aria-label="Previous ayah" class={step}><SkipForward class="w-4 h-4" /></button>
		<button type="button" onclick={audio.stop} title={t('stop')} aria-label={t('stop')} class={step}><X class="w-4 h-4" /></button>
	</div>
{/if}
