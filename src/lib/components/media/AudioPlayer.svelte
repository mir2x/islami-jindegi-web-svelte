<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import { formatClock, formatFileSize } from '#lib/audio.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';

	interface Props {
		src: string;
		/** Namespace holding audioError / audioDuration / audioDurationValue / audioSize / download. */
		ns: string;
		/** Link for the Download button; omit to hide it. */
		downloadHref?: string;
		/** Show the duration and file-size lines below the player. */
		meta?: boolean;
		/** Reported back so a parent can show the duration in its own layout. */
		duration?: number;
		/** File size in bytes once known (from a HEAD request). */
		size?: number | null;
		/** Always show Latin digits in the clock (the dedicated bayan page does). */
		latinDigits?: boolean;
	}
	let { src, ns, downloadHref, meta = true, duration = $bindable(0), size = $bindable(null), latinDigits = false }: Props = $props();

	// svelte-ignore state_referenced_locally
	const t = useT(ns);
	const locale = $derived(currentLocale());
	const clockLocale = $derived(latinDigits ? 'en' : locale);

	let audio = $state<HTMLAudioElement>();
	let bar = $state<HTMLElement>();
	let playing = $state(false);
	let time = $state(0);
	let failed = $state(false);

	const pct = $derived(duration ? (time / duration) * 100 : 0);

	// File size comes from a HEAD request's content-length; a new src never shows the old size.
	$effect(() => {
		const url = src;
		size = null;
		const ac = new AbortController();
		fetch(url, { method: 'HEAD', signal: ac.signal })
			.then((res) => {
				const len = res.headers.get('content-length');
				if (len && !ac.signal.aborted) size = Number(len);
			})
			.catch(() => {});
		return () => ac.abort();
	});

	function toggle() {
		if (!audio) return;
		if (playing) audio.pause();
		else audio.play().catch(() => (failed = true));
	}
	function seek(clientX: number) {
		if (!bar || !audio || !duration) return;
		const rect = bar.getBoundingClientRect();
		audio.currentTime = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * duration;
		time = audio.currentTime;
	}
</script>

<audio
	bind:this={audio}
	{src}
	preload="metadata"
	onplay={() => (playing = true)}
	onpause={() => (playing = false)}
	onended={() => (playing = false)}
	onloadedmetadata={(e) => (duration = e.currentTarget.duration)}
	ontimeupdate={(e) => (time = e.currentTarget.currentTime)}
	onerror={() => (failed = true)}
></audio>

<div class="flex items-center gap-4 print:hidden">
	<button
		type="button"
		onclick={toggle}
		aria-label={playing ? 'Pause' : 'Play'}
		class="w-14 h-14 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
	>
		{#if playing}<Pause class="w-5.5 h-5.5" />{:else}<Play class="w-5.5 h-5.5 ml-0.5" />{/if}
	</button>
	<div class="flex-1 min-w-0">
		<div
			bind:this={bar}
			role="slider"
			tabindex="0"
			aria-label="Seek"
			aria-valuemin={0}
			aria-valuemax={Math.round(duration)}
			aria-valuenow={Math.round(time)}
			onclick={(e) => seek(e.clientX)}
			onkeydown={(e) => {
				if (!audio) return;
				if (e.key === 'ArrowRight') audio.currentTime += 5;
				else if (e.key === 'ArrowLeft') audio.currentTime -= 5;
			}}
			class="relative h-2 rounded-full bg-muted cursor-pointer group"
		>
			<div class="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width]" style:width="{pct}%"></div>
			<div class="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full bg-primary shadow opacity-0 group-hover:opacity-100 transition-opacity" style:left="{pct}%"></div>
		</div>
		<div class="flex items-center justify-between mt-1.5 text-sm text-muted-foreground tabular-nums">
			<span>{formatClock(time, clockLocale)}</span><span>{formatClock(duration, clockLocale)}</span>
		</div>
	</div>
</div>

{#if failed}<p class="text-sm text-destructive mt-3">{t('audioError')}</p>{/if}

{#if meta}
	{#if duration > 0}
		<div class="flex items-center gap-2 mt-6 text-base">
			<span class="text-muted-foreground">{t('audioDuration')}:</span>
			<span class="font-medium text-foreground">{t('audioDurationValue', { minutes: Math.max(1, Math.round(duration / 60)) })}</span>
		</div>
	{/if}
	{#if size != null}
		<div class="flex items-center gap-2 mt-2 text-base">
			<span class="text-muted-foreground">{t('audioSize')}:</span>
			<span class="font-medium text-foreground">{formatFileSize(size, locale)}</span>
		</div>
	{/if}
{/if}

{#if downloadHref}
	<a
		href={downloadHref}
		download
		class="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-base font-medium text-foreground hover:bg-muted transition-colors print:hidden"
	>
		<Download class="w-4 h-4" />{t('download')}
	</a>
{/if}
