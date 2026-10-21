<script lang="ts">
	import AlignJustify from '@lucide/svelte/icons/align-justify';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import BookOpenText from '@lucide/svelte/icons/book-open-text';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import Settings from '@lucide/svelte/icons/settings';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { QuranSurahDetail } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		surah: QuranSurahDetail;
		navOpen: boolean;
		settingsOpen: boolean;
		ontoggleNav: () => void;
		ontoggleSettings: () => void;
		onsearch: () => void;
	}
	let { surah, navOpen, settingsOpen, ontoggleNav, ontoggleSettings, onsearch }: Props = $props();

	const t = useT('SurahReader');
	const n = useNum();
	const locale = $derived(currentLocale());
	const revelation = $derived(surah.revelationType === 'Meccan' ? t('meccan') : surah.revelationType === 'Medinan' ? t('medinan') : surah.revelationType);
	const icon = 'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';
</script>

<div class="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-background z-10">
	<a href={localePath('/quran?mode=text', locale)} aria-label="Quran" class={icon}><ArrowLeft class="w-5 h-5" /></a>
	<button type="button" onclick={ontoggleNav} class="flex-1 min-w-0 text-left max-sm:pointer-events-none">
		<div class="flex items-center gap-1">
			<h1 class="font-bold text-foreground text-base leading-tight truncate">{surah.nameBengali}</h1>
			<ChevronDown class={cn('w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 max-sm:hidden', navOpen && 'rotate-180')} />
		</div>
		<p class="text-xs text-muted-foreground">{t('surahMeta', { ayahCount: n(surah.totalAyahs), revelation, para: n(surah.paraNumber) })}</p>
	</button>
	<p class="max-sm:hidden text-2xl text-muted-foreground" style="font-family: var(--quran-arabic-font); direction: rtl">{surah.nameArabic}</p>
	<a href={localePath(`/quran/tilawat/${surah.surahNumber}?from=surah`, locale)} title={t('tilawatMode')} aria-label={t('tilawatMode')} class={icon}><AlignJustify class="max-sm:hidden w-5 h-5" /><BookOpenText class="sm:hidden w-5 h-5" /></a>
	<button type="button" onclick={onsearch} title={t('searchQuran')} aria-label={t('searchQuran')} class={icon}><Search class="w-5 h-5" /></button>
	<!-- Phones: toggles the surah / ayah / para / bookmark sidebar. -->
	<button type="button" onclick={ontoggleNav} aria-label="Menu" aria-pressed={navOpen} class={cn('sm:hidden p-1.5 rounded-lg transition-colors', navOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}><Menu class="w-5 h-5" /></button>
	<button
		type="button"
		onclick={ontoggleSettings}
		title={t('settings')}
		aria-label={t('settings')}
		class={cn('max-sm:hidden p-1.5 rounded-lg transition-colors', settingsOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
		><Settings class="w-5 h-5" /></button
	>
</div>
