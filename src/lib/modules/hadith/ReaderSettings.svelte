<script lang="ts">
	import ChipSelect from '#lib/components/ui/ChipSelect.svelte';
	import SizeStepper from '#lib/components/ui/SizeStepper.svelte';
	import Switch from '#lib/components/ui/Switch.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { ARABIC_FONTS, BENGALI_FONTS } from '#lib/quran-fonts.ts';
	import { readerPrefs as prefs } from './reader-prefs.svelte.ts';

	const t = useT('HadithReader');
	const toOptions = (fonts: { key: string; label: string }[]) => fonts.map((f) => ({ value: f.key, label: f.label }));
	const heading = 'text-xs font-semibold text-muted-foreground uppercase tracking-wider';
</script>

<div class="shrink-0 border-b border-border bg-muted/30 px-4 py-4">
	<div class="max-w-2xl mx-auto space-y-4">
		<div class="flex items-center gap-3">
			<p class={heading}>{t('showArabic')}</p>
			<Switch checked={prefs.showArabic} label={t('showArabic')} onchange={(v) => (prefs.showArabic = v)} />
		</div>
		<div class="grid sm:grid-cols-2 gap-4">
			{#if prefs.showArabic}
				<div>
					<p class="{heading} mb-2">{t('arabicFont')}</p>
					<ChipSelect class="mb-2" options={toOptions(ARABIC_FONTS)} selected={prefs.arabicFont.key} onpick={(k) => prefs.arabicFont.set(k)} />
					<SizeStepper size={prefs.arabicSize} onstep={prefs.stepArabic} />
				</div>
			{/if}
			<div>
				<p class="{heading} mb-2">{t('bengaliFont')}</p>
				<ChipSelect class="mb-2" options={toOptions(BENGALI_FONTS)} selected={prefs.bengaliFont.key} onpick={(k) => prefs.bengaliFont.set(k)} />
				<SizeStepper size={prefs.bengaliSize} onstep={prefs.stepBengali} />
			</div>
		</div>
	</div>
</div>
