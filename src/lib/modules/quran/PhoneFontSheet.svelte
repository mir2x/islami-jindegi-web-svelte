<script lang="ts">
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { ARABIC_FONTS, BENGALI_FONTS } from '#lib/quran-fonts.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import FontDropdown from './FontDropdown.svelte';
	import { ARABIC_SIZE, BENGALI_SIZE, quranPrefs as prefs } from './prefs.svelte.ts';

	let { open, onclose }: { open: boolean; onclose: () => void } = $props();

	const t = useT('SurahReader');
	const n = useNum();
	const ARABIC_SAMPLE = 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ';
	const BENGALI_SAMPLE = 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে';
</script>

{#snippet section(title: string, sample: string, rtl: boolean, fonts: { key: string; label: string }[], family: string, activeKey: string, onkey: (key: string) => void, size: number, onsize: (v: number) => void, range: { min: number; max: number; step: number })}
	<section class="rounded-2xl border border-border bg-muted/30 p-4">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold text-foreground">{title}</h3>
			<span class="text-xs tabular-nums text-muted-foreground">{n(size)}</span>
		</div>
		<p class="my-3 py-3 text-foreground leading-relaxed text-center rounded-xl bg-background/60 truncate" style:font-family={family} style:font-size="{size}px" style:direction={rtl ? 'rtl' : 'ltr'}>{sample}</p>
		<FontDropdown {fonts} {activeKey} onkey={onkey} />
		<div class="mt-4 flex items-center gap-3">
			<span class="text-xs text-muted-foreground">A</span>
			<input type="range" min={range.min} max={range.max} step={range.step} value={size} oninput={(e) => onsize(Number(e.currentTarget.value))} aria-label={title} class="flex-1 accent-primary" />
			<span class="text-xl text-muted-foreground leading-none">A</span>
		</div>
	</section>
{/snippet}

<!-- Phones only: the reading fonts (Arabic and Bengali: typeface and size) in a sheet above the bottom bar. -->
{#if open}
	<div class="sm:hidden absolute inset-x-0 top-0 bottom-14 z-[60] flex items-end">
		<button type="button" tabindex="-1" aria-label="Close" onclick={onclose} class="absolute inset-0 bg-black/50 cursor-default"></button>
		<div class="relative w-full bg-background rounded-t-3xl border-t border-border shadow-2xl max-h-[85%] flex flex-col overflow-hidden">
			<div class="mx-auto mt-2.5 h-1 w-10 rounded-full bg-muted-foreground/30 shrink-0"></div>
			<p class="px-5 pt-3 pb-3 text-lg font-bold text-foreground shrink-0">{t('settings')}</p>
			<div class="overflow-y-auto px-4 pb-5 space-y-3">
				{@render section(t('arabicFont'), ARABIC_SAMPLE, true, ARABIC_FONTS, prefs.arabicFont.family, prefs.arabicFont.key, (k) => prefs.arabicFont.set(k), prefs.arabicSize, prefs.setArabicSize, ARABIC_SIZE)}
				{@render section(t('bengaliFont'), BENGALI_SAMPLE, false, BENGALI_FONTS, prefs.bengaliFont.family, prefs.bengaliFont.key, (k) => prefs.bengaliFont.set(k), prefs.bengaliSize, prefs.setBengaliSize, BENGALI_SIZE)}
			</div>
		</div>
	</div>
{/if}
