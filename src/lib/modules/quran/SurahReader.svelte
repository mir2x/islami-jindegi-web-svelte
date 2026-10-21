<script lang="ts">
	import { goto } from '$app/navigation';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { onDestroy, tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { quranLastRead } from '#lib/storage/last-read.svelte.ts';
	import type { QuranReciter, QuranSurah, QuranSurahDetail } from '#lib/types.ts';
	import AudioBar from './AudioBar.svelte';
	import AyahCard from './AyahCard.svelte';
	import { quranFontVars, quranPrefs as prefs } from './prefs.svelte.ts';
	import SearchModal from './SearchModal.svelte';
	import { SurahAudio } from './surah-audio.svelte.ts';
	import SurahNav from './SurahNav.svelte';
	import SurahSettings from './SurahSettings.svelte';
	import SurahTopBar from './SurahTopBar.svelte';
	import TafsirModal from './TafsirModal.svelte';
	import SurahPhoneBar from './SurahPhoneBar.svelte';
	import TilawatDialog from './TilawatDialog.svelte';

	interface Props {
		surah: QuranSurahDetail;
		allSurahs: QuranSurah[];
		reciters: QuranReciter[];
		translators: string[];
		initialAyah: number | null;
	}
	let { surah, allSurahs, reciters, translators, initialAyah }: Props = $props();

	const t = useT('SurahReader');
	const locale = $derived(currentLocale());
	const desktop = new MediaQuery('min-width: 1024px', false);
	let scroller = $state<HTMLElement>();
	let settingsOpen = $state(false);
	let navPref = $state<boolean | null>(null);
	let searchOpen = $state(false);
	let tilawatOpen = $state(false);
	let tafsirAyah = $state<number | null>(null);
	let showWords = $state(false);
	let autoScroll = $state(false);
	let autoScrollSpeed = $state(1);

	// The surah navigator starts open on desktop and closed on mobile until the reader toggles it.
	const navOpen = $derived(navPref ?? desktop.current);
	const selectedTranslators = $derived(prefs.translators(translators));
	const reciterId = $derived(prefs.reciter(reciters));
	const prev = $derived(surah.surahNumber > 1 ? allSurahs.find((s) => s.number === surah.surahNumber - 1) : null);
	const next = $derived(surah.surahNumber < 114 ? allSurahs.find((s) => s.number === surah.surahNumber + 1) : null);

	function scrollToAyah(n: number) {
		requestAnimationFrame(() => scroller?.querySelector(`[data-ayah="${n}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
	}
	const audio = new SurahAudio(scrollToAyah);
	onDestroy(() => audio.destroy());

	/** Opens a surah (and ayah): scrolls when it is the current one, navigates otherwise. */
	async function go(number: number, ayah?: number) {
		if (number < 1 || number > 114) return;
		const query = ayah ? `?ayah=${ayah}` : '';
		if (number === surah.surahNumber) {
			if (ayah) {
				audio.activeAyah = ayah;
				scrollToAyah(ayah);
				void goto(`${window.location.pathname}${query}`, { replace: true, shallow: true, reset: false });
			} else {
				audio.activeAyah = null;
				scroller?.scrollTo({ top: 0 });
			}
			return;
		}
		await goto(localePath(`/quran/surah/${number}${query}`, locale), { reset: false });
	}

	// A different surah (or a deep link) arrived: start clean, then land on the requested ayah.
	$effect(() => {
		void surah.surahNumber;
		const target = initialAyah;
		audio.reset();
		settingsOpen = false;
		tilawatOpen = false;
		audio.activeAyah = target;
		void tick().then(() => (target ? scrollToAyah(target) : scroller?.scrollTo({ top: 0, behavior: 'auto' })));
	});
	$effect(() => void audio.load(reciterId, surah.surahNumber, surah.totalAyahs));

	// Continue-reading: remember the last viewed ayah.
	$effect(() => {
		if (audio.activeAyah !== null) quranLastRead.set({ surahNumber: surah.surahNumber, surahName: surah.nameBengali, ayahNumber: audio.activeAyah });
	});

	$effect(() => {
		if (!autoScroll) return;
		let raf = 0;
		const step = () => {
			const el = scroller;
			if (el) {
				el.scrollTop += 0.4 * autoScrollSpeed;
				if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) return void (autoScroll = false);
			}
			raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	});

	function onKey(e: KeyboardEvent) {
		const tag = (e.target as HTMLElement).tagName;
		if (e.key !== ' ' || tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON' || tilawatOpen) return;
		e.preventDefault();
		audio.toggle();
	}
	const pager = 'flex w-full items-center gap-2 p-3.5 text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group';
</script>

<svelte:window onkeydown={onKey} />

<div class="relative flex flex-col bg-background h-full overflow-hidden" style={quranFontVars()}>
	<SurahTopBar
		{surah}
		{navOpen}
		{settingsOpen}
		ontoggleNav={() => (navPref = !navOpen)}
		ontoggleSettings={() => (settingsOpen = !settingsOpen)}
		onsearch={() => (searchOpen = true)}
	/>

	{#if settingsOpen}
		<SurahSettings
			{translators}
			{selectedTranslators}
			{reciters}
			{reciterId}
			{showWords}
			onwords={(v) => (showWords = v)}
			{autoScroll}
			{autoScrollSpeed}
			onautoscroll={(v) => (autoScroll = v)}
			onspeed={(v) => (autoScrollSpeed = v)}
		/>
	{/if}

	<div class="relative flex flex-1 overflow-hidden">
		<!-- Phones: tap outside the sidebar to close it. -->
		{#if navOpen}<button type="button" tabindex="-1" aria-label="Close" onclick={() => (navPref = false)} class="sm:hidden absolute inset-0 z-40 bg-black/50 cursor-default"></button>{/if}
		{#if navOpen}<SurahNav {allSurahs} surahNumber={surah.surahNumber} activeAyah={audio.activeAyah} ongo={go} />{/if}

		<div bind:this={scroller} class="flex-1 overflow-y-auto">
			<div class="max-w-2xl mx-auto w-full px-4 py-6">
				{#each surah.ayahs as ayah (ayah.number)}
					<AyahCard
						{ayah}
						surahNumber={surah.surahNumber}
						surahName={surah.nameBengali}
						translators={selectedTranslators}
						{showWords}
						active={audio.activeAyah === ayah.number}
						onplay={() => audio.play(ayah.number)}
						onplaysingle={() => audio.playSingle(ayah.number)}
						ontafsir={() => (tafsirAyah = ayah.number)}
					/>
				{/each}
			</div>

			<div class="max-w-2xl mx-auto w-full px-4 pb-6 grid grid-cols-2 gap-3">
				{#if prev}
					<a href={localePath(`/quran/surah/${prev.number}`, locale)} class={pager}
						><ChevronLeft class="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary" />
						<div class="min-w-0">
							<p class="text-xs text-muted-foreground">{t('prevSurah')}</p>
							<p class="text-sm font-semibold truncate group-hover:text-primary">{prev.nameBengali}</p>
						</div></a
					>
				{:else}<div></div>{/if}
				{#if next}
					<a href={localePath(`/quran/surah/${next.number}`, locale)} class="{pager} justify-end"
						><div class="min-w-0 text-right">
							<p class="text-xs text-muted-foreground">{t('nextSurah')}</p>
							<p class="text-sm font-semibold truncate group-hover:text-primary">{next.nameBengali}</p>
						</div>
						<ChevronRight class="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary" /></a
					>
				{/if}
			</div>
		</div>
	</div>

	<AudioBar {audio} surahName={surah.nameBengali} totalAyahs={surah.totalAyahs} onrange={() => (tilawatOpen = true)} />

	<SurahPhoneBar
		{translators}
		selected={selectedTranslators}
		ontoggle={(name) => prefs.toggleTranslator(name, translators)}
		{showWords}
		onwords={() => (showWords = !showWords)}
		listenOpen={tilawatOpen}
		onlisten={() => {
			settingsOpen = false;
			tilawatOpen = !tilawatOpen;
		}}
		onopen={() => {
			tilawatOpen = false;
			settingsOpen = false;
		}}
		{settingsOpen}
		onsettings={() => {
			tilawatOpen = false;
			settingsOpen = !settingsOpen;
		}}
	/>

	{#if tilawatOpen}
		<TilawatDialog
			onclose={() => (tilawatOpen = false)}
			surahNumber={surah.surahNumber}
			totalAyahs={surah.totalAyahs}
			{allSurahs}
			{reciters}
			{reciterId}
			loading={audio.loading}
			onsurah={(n) => {
				tilawatOpen = false;
				void go(n);
			}}
			onreciter={prefs.setReciter}
			onstart={(s, e, r) => audio.startRange(s, e, r)}
		/>
	{/if}
	{#if searchOpen}<SearchModal onclose={() => (searchOpen = false)} onnavigate={go} />{/if}
	{#if tafsirAyah !== null}<TafsirModal surahNumber={surah.surahNumber} surahName={surah.nameBengali} ayahNumber={tafsirAyah} onclose={() => (tafsirAyah = null)} />{/if}
</div>
