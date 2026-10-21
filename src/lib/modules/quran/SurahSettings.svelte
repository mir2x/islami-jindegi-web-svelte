<script lang="ts">
	import ChipSelect from '#lib/components/ui/ChipSelect.svelte';
	import SizeStepper from '#lib/components/ui/SizeStepper.svelte';
	import Switch from '#lib/components/ui/Switch.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { ARABIC_FONTS, BENGALI_FONTS } from '#lib/quran-fonts.ts';
	import type { QuranReciter } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { quranPrefs as prefs } from './prefs.svelte.ts';

	interface Props {
		translators: string[];
		selectedTranslators: string[];
		reciters: QuranReciter[];
		reciterId: string;
		showWords: boolean;
		onwords: (value: boolean) => void;
		autoScroll: boolean;
		autoScrollSpeed: number;
		onautoscroll: (value: boolean) => void;
		onspeed: (value: number) => void;
	}
	let { translators, selectedTranslators, reciters, reciterId, showWords, onwords, autoScroll, autoScrollSpeed, onautoscroll, onspeed }: Props = $props();

	const t = useT('SurahReader');
	const n = useNum();
	const heading = 'text-xs font-semibold text-muted-foreground uppercase tracking-wider';
	const fontOptions = (fonts: { key: string; label: string }[]) => fonts.map((f) => ({ value: f.key, label: f.label }));
	const SPEEDS = [0.5, 1, 1.5, 2, 3];
</script>

<div class="max-sm:hidden min-h-0 overflow-y-auto border-b border-border bg-muted/30 px-4 py-4">
	<div class="max-w-2xl mx-auto space-y-4">
		<div>
			<p class="{heading} mb-2">{t('translationLabel')}</p>
			<ChipSelect options={translators.map((x) => ({ value: x, label: x }))} selected={selectedTranslators} onpick={(name) => prefs.toggleTranslator(name, translators)} />
		</div>
		{#if reciters.length > 0}
			<div>
				<p class="{heading} mb-2">{t('reciter')}</p>
				<ChipSelect options={reciters.map((r) => ({ value: r.id, label: r.name }))} selected={reciterId} onpick={prefs.setReciter} />
			</div>
		{/if}
		<div class="flex items-center gap-3">
			<p class={heading}>{t('wordByWord')}</p>
			<Switch checked={showWords} label={t('wordByWord')} onchange={onwords} />
		</div>

		<div class="grid sm:grid-cols-2 gap-4">
			<div>
				<p class="{heading} mb-2">{t('arabicFont')}</p>
				<ChipSelect class="mb-2" options={fontOptions(ARABIC_FONTS)} selected={prefs.arabicFont.key} onpick={(k) => prefs.arabicFont.set(k)} />
				<SizeStepper size={prefs.arabicSize} onstep={prefs.stepArabic} />
			</div>
			<div>
				<p class="{heading} mb-2">{t('bengaliFont')}</p>
				<ChipSelect class="mb-2" options={fontOptions(BENGALI_FONTS)} selected={prefs.bengaliFont.key} onpick={(k) => prefs.bengaliFont.set(k)} />
				<SizeStepper size={prefs.bengaliSize} onstep={prefs.stepBengali} />
			</div>
		</div>

		<div>
			<div class="flex items-center gap-3 mb-2">
				<p class={heading}>{t('autoScroll')}</p>
				<Switch checked={autoScroll} label={t('autoScroll')} onchange={onautoscroll} />
			</div>
			<div class="flex flex-wrap gap-2">
				{#each SPEEDS as sp (sp)}
					<button
						type="button"
						onclick={() => onspeed(sp)}
						class={cn(
							'px-2.5 py-1 rounded-lg text-xs transition-colors',
							autoScrollSpeed === sp ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
						)}>{n(sp)}x</button
					>
				{/each}
			</div>
		</div>
	</div>
</div>
