<script lang="ts">
	import { bn } from '#lib/bengali-numerals.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { ARABIC_FONTS, BENGALI_FONTS } from '#lib/quran-fonts.ts';
	import {
		CALCULATION_METHODS,
		DEFAULT_SETTINGS,
		getSettings,
		HIJRI_ADJUSTMENTS,
		MADHABS,
		PRAYER_OFFSETS,
		saveSettings,
		type AppSettings,
		type MadhabSetting
	} from '#lib/settings.ts';
	import { arabicFont, bengaliFont } from '#lib/storage/fonts.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import SettingsRow from './SettingsRow.svelte';
	import SettingsSection from './SettingsSection.svelte';
	import SettingsSelect from './SettingsSelect.svelte';

	const t = useT('SettingsPage');
	let settings = $state<AppSettings>(getSettings());

	// Persist on every change: the old site saved immediately too (no explicit save button).
	function update(patch: Partial<AppSettings>) {
		settings = saveSettings(patch);
	}
	// Fonts live under the Quran readers' own keys, so these pickers and the in-reader ones drive one preference.
	function reset() {
		settings = saveSettings(DEFAULT_SETTINGS);
		arabicFont.set(ARABIC_FONTS[0].key);
		bengaliFont.set(BENGALI_FONTS[0].key);
	}
	const fontOptions = (fonts: { key: string; label: string }[]) => fonts.map((f) => ({ value: f.key, label: f.label }));
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
	<div class="flex items-center justify-between gap-3 mb-8">
		<h1 class="text-3xl font-bold text-foreground">{t('title')}</h1>
		<button type="button" onclick={reset} class="text-xs text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">{t('resetToDefault')}</button>
	</div>

	<div class="space-y-5">
		<SettingsSection title={t('generalSection')}>
			<SettingsRow label={t('hijriAdjustmentLabel')}>
				<div class="flex gap-1.5">
					{#each HIJRI_ADJUSTMENTS as v (v)}
						<button
							type="button"
							onclick={() => update({ hijriAdjustment: v })}
							class={cn(
								'flex-1 py-2 rounded-lg border text-sm font-medium transition-all tabular-nums',
								settings.hijriAdjustment === v
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-primary'
							)}
						>
							{v > 0 ? `+${bn(v)}` : bn(v)}
						</button>
					{/each}
				</div>
			</SettingsRow>
			<SettingsRow label={t('arabicFontLabel')}><SettingsSelect value={arabicFont.key} options={fontOptions(ARABIC_FONTS)} onchange={(k) => arabicFont.set(k)} /></SettingsRow>
			<SettingsRow label={t('banglaFontLabel')}><SettingsSelect value={bengaliFont.key} options={fontOptions(BENGALI_FONTS)} onchange={(k) => bengaliFont.set(k)} /></SettingsRow>
		</SettingsSection>

		<SettingsSection title={t('prayerCalcSection')}>
			<SettingsRow label={t('madhabLabel')}><SettingsSelect value={settings.madhab} options={MADHABS} onchange={(v) => update({ madhab: v as MadhabSetting })} /></SettingsRow>
			<SettingsRow label={t('methodLabel')}><SettingsSelect value={settings.method} options={CALCULATION_METHODS} onchange={(v) => update({ method: v })} /></SettingsRow>
		</SettingsSection>

		<SettingsSection title={t('offsetSection')}>
			{#each PRAYER_OFFSETS as { key, label } (key)}
				<SettingsRow {label}>
					<div class="flex items-center gap-2">
						<input
							type="number"
							min={-60}
							max={60}
							value={settings[key]}
							oninput={(e) => {
								const n = parseInt(e.currentTarget.value, 10);
								update({ [key]: Number.isNaN(n) ? 0 : n });
							}}
							class="w-full px-3 py-2 rounded-xl border border-border bg-muted text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
						/>
						<span class="text-xs text-muted-foreground shrink-0">{t('minuteUnit')}</span>
					</div>
				</SettingsRow>
			{/each}
		</SettingsSection>
	</div>

	<p class="text-xs text-muted-foreground text-center mt-6">{t('footerNote')}</p>
</div>
