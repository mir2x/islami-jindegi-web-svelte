<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import BookOpenText from '@lucide/svelte/icons/book-open-text';
	import Copy from '@lucide/svelte/icons/copy';
	import Settings from '@lucide/svelte/icons/settings';
	import Share2 from '@lucide/svelte/icons/share-2';
	import X from '@lucide/svelte/icons/x';
	import ChipSelect from '#lib/components/ui/ChipSelect.svelte';
	import Overlay from '#lib/components/ui/Overlay.svelte';
	import SizeStepper from '#lib/components/ui/SizeStepper.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { ARABIC_FONTS } from '#lib/quran-fonts.ts';
	import { quranBookmarks } from '#lib/storage/bookmarks.svelte.ts';
	import { quranLastRead } from '#lib/storage/last-read.svelte.ts';
	import type { QuranSurah, QuranSurahDetail } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { quranPrefs as prefs } from './prefs.svelte.ts';
	import TafsirModal from './TafsirModal.svelte';

	let { surah, allSurahs }: { surah: QuranSurahDetail; allSurahs: QuranSurah[] } = $props();

	const t = useT('TilawatReader');
	const n = useNum();
	const locale = $derived(currentLocale());
	let selectedAyah = $state<number | null>(null);
	let tafsirAyah = $state<number | null>(null);
	let settingsOpen = $state(false);

	const selected = $derived(selectedAyah !== null ? (surah.ayahs.find((a) => a.number === selectedAyah) ?? null) : null);
	const bookmarked = $derived(selected !== null && quranBookmarks.has({ surahNumber: surah.surahNumber, ayahNumber: selected.number }));
	const prev = $derived(surah.surahNumber > 1 ? allSurahs.find((s) => s.number === surah.surahNumber - 1) : null);
	const next = $derived(surah.surahNumber < 114 ? allSurahs.find((s) => s.number === surah.surahNumber + 1) : null);
	const bismillah = $derived(surah.surahNumber !== 1 && surah.surahNumber !== 9);
	const arabic = $derived(`font-family: ${prefs.arabicFont.family}; direction: rtl`);

	$effect(() => quranLastRead.set({ surahNumber: surah.surahNumber, surahName: surah.nameBengali, ayahNumber: 1 }));

	const copy = () => selected && navigator.clipboard.writeText(selected.arabic);
	const share = () => selected && (navigator.share ? navigator.share({ text: selected.arabic }) : navigator.clipboard.writeText(window.location.href));
	const toggleBookmark = () =>
		selected && quranBookmarks.toggle({ surahNumber: surah.surahNumber, ayahNumber: selected.number, surahName: surah.nameBengali, arabic: selected.arabic });
	const icon = 'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';
	const action = 'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-muted hover:bg-muted/70 transition-colors text-xs text-muted-foreground';
	const pager = 'flex items-center gap-2 p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all';
</script>

<div class="flex flex-col bg-background h-full">
	<div class="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-background z-10">
		<a href={localePath('/quran?mode=tilawat', locale)} aria-label="Quran" class={icon}><ArrowLeft class="w-5 h-5" /></a>
		<div class="flex-1 min-w-0">
			<h1 class="font-bold text-foreground text-base leading-tight truncate">{surah.nameBengali}</h1>
			<p class="text-xs text-muted-foreground">{t('subtitle', { count: n(surah.totalAyahs) })}</p>
		</div>
		<a href={localePath(`/quran/surah/${surah.surahNumber}`, locale)} title={t('viewInSurahMode')} aria-label={t('viewInSurahMode')} class={icon}><BookOpen class="w-5 h-5" /></a>
		<button
			type="button"
			onclick={() => (settingsOpen = !settingsOpen)}
			aria-label="Settings"
			class={cn('p-1.5 rounded-lg transition-colors', settingsOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
			><Settings class="w-5 h-5" /></button
		>
	</div>

	{#if settingsOpen}
		<div class="shrink-0 border-b border-border bg-muted/30 px-4 py-4">
			<div class="max-w-2xl mx-auto space-y-3">
				<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('arabicFont')}</p>
				<ChipSelect class="mb-2" options={ARABIC_FONTS.map((f) => ({ value: f.key, label: f.label }))} selected={prefs.arabicFont.key} onpick={(k) => prefs.arabicFont.set(k)} />
				<SizeStepper size={prefs.arabicSize} onstep={prefs.stepArabic} />
			</div>
		</div>
	{/if}

	<!-- Continuous flowing text: a simplified analog of the app's ruled-line tilawat pagination, with inline ayah-number markers. -->
	<div class="flex-1 overflow-y-auto">
		<div class="max-w-3xl mx-auto w-full px-4 sm:px-8 py-10">
			{#if bismillah}<p class="text-center text-xl text-foreground mb-8" style={arabic}>بِسۡمِ اللّٰہِ الرَّحۡمٰنِ الرَّحِیۡمِ</p>{/if}
			<p dir="rtl" class="text-justify leading-[2.6]" style="{arabic}; font-size: {prefs.arabicSize}px">
				{#each surah.ayahs as ayah (ayah.number)}
					<span
						>{ayah.arabic}
						<button
							type="button"
							onclick={() => (selectedAyah = ayah.number)}
							aria-label={t('ayah', { number: n(ayah.number) })}
							class="inline-flex items-center justify-center w-7 h-7 mx-1 rounded-full bg-muted text-primary text-xs font-bold align-middle hover:bg-primary/20 transition-colors"
							style="font-family: sans-serif">{n(ayah.number)}</button
						>
					</span>
				{/each}
			</p>
		</div>
		<div class="max-w-3xl mx-auto w-full px-4 pb-10 grid grid-cols-2 gap-3">
			{#if prev}<a href={localePath(`/quran/tilawat/${prev.number}`, locale)} class={pager}
					><div class="min-w-0">
						<p class="text-xs text-muted-foreground">{t('prevSurah')}</p>
						<p class="text-sm font-semibold truncate">{prev.nameBengali}</p>
					</div></a
				>{:else}<div></div>{/if}
			{#if next}<a href={localePath(`/quran/tilawat/${next.number}`, locale)} class="{pager} justify-end"
					><div class="min-w-0 text-right">
						<p class="text-xs text-muted-foreground">{t('nextSurah')}</p>
						<p class="text-sm font-semibold truncate">{next.nameBengali}</p>
					</div></a
				>{/if}
		</div>
	</div>

	{#if selected}
		<Overlay onclose={() => (selectedAyah = null)} label={t('ayah', { number: n(selected.number) })} class="w-full sm:max-w-md sm:mb-6 sm:rounded-2xl p-4">
			<div class="flex items-center justify-between mb-3">
				<p class="text-sm font-semibold text-foreground">{t('ayah', { number: n(selected.number) })}</p>
				<button type="button" onclick={() => (selectedAyah = null)} aria-label="Close" class="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
					><X class="w-4 h-4" /></button
				>
			</div>
			<div class="flex items-center gap-2">
				<button type="button" onclick={copy} class={action}><Copy class="w-4 h-4" />{t('copy')}</button>
				<button type="button" onclick={share} class={action}><Share2 class="w-4 h-4" />{t('share')}</button>
				<button
					type="button"
					onclick={toggleBookmark}
					class={cn(
						'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors text-xs',
						bookmarked ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
					)}><Bookmark class={cn('w-4 h-4', bookmarked && 'fill-current')} />{t('bookmark')}</button
				>
				<button
					type="button"
					onclick={() => {
						tafsirAyah = selected.number;
						selectedAyah = null;
					}}
					class={action}><BookOpenText class="w-4 h-4" />{t('tafsir')}</button
				>
			</div>
		</Overlay>
	{/if}
	{#if tafsirAyah !== null}<TafsirModal surahNumber={surah.surahNumber} surahName={surah.nameBengali} ayahNumber={tafsirAyah} onclose={() => (tafsirAyah = null)} />{/if}
</div>
