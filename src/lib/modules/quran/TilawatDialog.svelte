<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Play from '@lucide/svelte/icons/play';
	import X from '@lucide/svelte/icons/x';
	import Overlay from '#lib/components/ui/Overlay.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { QuranReciter, QuranSurah } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';

	interface Props {
		onclose: () => void;
		surahNumber: number;
		/** The range's end when the dialog opens or the surah changes: 1 in the surah reader, the whole surah in the mushaf. */
		defaultEnd?: 'one' | 'all';
		totalAyahs: number;
		allSurahs: QuranSurah[];
		reciters: QuranReciter[];
		reciterId: string;
		loading: boolean;
		onsurah: (number: number) => void;
		onreciter: (id: string) => void;
		onstart: (start: number, end: number, repeats: number) => void;
	}
	let { onclose, surahNumber, defaultEnd = 'one', totalAyahs, allSurahs, reciters, reciterId, loading, onsurah, onreciter, onstart }: Props = $props();

	const t = useT('SurahReader');
	const n = useNum();
	let start = $state(1);
	let end = $state(1);
	// A different surah starts over from its first ayah.
	$effect(() => {
		void surahNumber;
		start = 1;
		end = defaultEnd === 'all' ? totalAyahs : 1;
	});
	let full = $state(false);
	let repeats = $state(1);
	const ayahs = $derived(Array.from({ length: totalAyahs }, (_, i) => i + 1));

	function begin() {
		const from = full ? 1 : Math.max(1, Math.min(start, end));
		const to = full ? totalAyahs : Math.min(totalAyahs, Math.max(start, end));
		onstart(from, to, repeats);
		onclose();
	}
	const field = 'flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50';
	const label = 'w-24 shrink-0 text-sm font-semibold text-foreground';
	const round = 'w-7 h-7 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors';
</script>

<Overlay {onclose} label={t('listenTilawatTitle')} class="w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl">
	<div class="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border">
		<p class="text-sm font-bold text-foreground">{t('listenTilawatTitle')}</p>
		<button
			type="button"
			onclick={onclose}
			aria-label="Close"
			class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
			><X class="w-4 h-4" /></button
		>
	</div>
	<div class="px-4 py-4 space-y-3">
		<div class="flex items-center gap-3">
			<p class={label}>{t('surahLabel')}</p>
			<select value={surahNumber} onchange={(e) => onsurah(Number(e.currentTarget.value))} class={field}>
				{#each allSurahs as s (s.number)}<option value={s.number} selected={s.number === surahNumber}>{n(s.number)}. {s.nameBengali}</option>{/each}
			</select>
		</div>
		{#if reciters.length > 0}
			<div class="flex items-center gap-3">
				<p class={label}>{t('reciterLabel')}</p>
				<select value={reciterId} onchange={(e) => onreciter(e.currentTarget.value)} class={field}>
					{#each reciters as r (r.id)}<option value={r.id} selected={r.id === reciterId}>{r.name}</option>{/each}
				</select>
			</div>
		{/if}
		<div class="flex items-center gap-3">
			<p class={label}>{t('startAyah')}</p>
			<select
				value={start}
				disabled={full}
				onchange={(e) => {
					start = Number(e.currentTarget.value);
					if (start > end) end = start;
				}}
				class={field}
			>
				{#each ayahs as a (a)}<option value={a} selected={a === start}>{n(a)}</option>{/each}
			</select>
		</div>
		<div class="flex items-center gap-3">
			<p class={label}>{t('endAyah')}</p>
			<select
				value={end}
				disabled={full}
				onchange={(e) => {
					end = Number(e.currentTarget.value);
					if (end < start) start = end;
				}}
				class={field}
			>
				{#each ayahs as a (a)}<option value={a} selected={a === end}>{n(a)}</option>{/each}
			</select>
		</div>
		<label class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/40 cursor-pointer select-none">
			<input type="checkbox" bind:checked={full} class="w-4 h-4 accent-primary" /><span class="text-sm font-medium text-foreground">{t('fullSurah')}</span>
		</label>
		<div class="flex items-center justify-center gap-3 px-3 py-2 rounded-lg border border-border bg-muted/40">
			<span class="text-sm font-medium text-foreground">{t('ayahRepeat')}</span>
			<button type="button" onclick={() => (repeats = Math.max(1, repeats - 1))} aria-label="Fewer" class={round}>−</button>
			<span class="text-sm text-muted-foreground w-6 text-center tabular-nums">{n(repeats)}</span>
			<button type="button" onclick={() => (repeats = Math.min(20, repeats + 1))} aria-label="More" class={round}>+</button>
		</div>
		<button
			type="button"
			onclick={begin}
			disabled={loading}
			class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
		>
			{#if loading}<Loader2 class="w-4 h-4 animate-spin" />{:else}<Play class="w-4 h-4" />{/if}{t('listenAudio')}
		</button>
	</div>
</Overlay>
