<script lang="ts">
	import { goto } from '$app/navigation';
	import Minimize from '@lucide/svelte/icons/minimize';
	import { onDestroy, onMount } from 'svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { mushafBookmarks } from '#lib/storage/bookmarks.svelte.ts';
	import { StoredValue } from '#lib/storage/stored.svelte.ts';
	import type { AyahBox, MushafEdition, QuranReciter, QuranSurah } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { quranPrefs as prefs } from '../prefs.svelte.ts';
	import TilawatDialog from '../TilawatDialog.svelte';
	import AudioPill from './AudioPill.svelte';
	import AyahMenu from './AyahMenu.svelte';
	import { AYAH_COUNTS, getSpreadPair, SURA_NAMES } from './data.ts';
	import { boxesFor, computeBounds, menuAnchor, preloadAround } from './geometry.ts';
	import { MushafAudio } from './mushaf-audio.svelte.ts';
	import { MushafIndex } from './mushaf-index.svelte.ts';
	import MushafDrawer from './MushafDrawer.svelte';
	import MushafTopBar from './MushafTopBar.svelte';
	import PageFace from './PageFace.svelte';
	import PageNav from './PageNav.svelte';

	interface Props {
		edition: MushafEdition;
		initialPage: number;
		reciters: QuranReciter[];
	}
	let { edition, initialPage, reciters }: Props = $props();

	const t = useT('MushafReader');
	const spreadStore = new StoredValue<string>('mushaf_spread_mode', '0', { bare: true });
	// svelte-ignore state_referenced_locally
	let page = $state(initialPage);
	let scale = $state(1);
	let barsVisible = $state(true);
	let selected = $state<{ sura: number; ayah: number } | null>(null);
	let drawerOpen = $state(false);
	let navSurah = $state(1);
	let navPara = $state(1);
	let tilawatOpen = $state(false);
	let tilawatSura = $state(1);
	let width = $state(0);
	let height = $state(0);
	let touchX: number | null = null;

	// svelte-ignore state_referenced_locally
	const index = new MushafIndex(edition.totalPages);
	const reciterId = $derived(prefs.reciter(reciters));
	const audio = new MushafAudio(
		() => reciterId,
		(sura, ayah) => {
			const target = index.ayahFirstPage.get(`${sura}:${ayah}`);
			if (target !== undefined && target !== page) goTo(target);
		}
	);
	onDestroy(() => audio.destroy());

	const spread = $derived(spreadStore.current === '1');
	const pair = $derived(spread ? getSpreadPair(page, edition.totalPages) : { right: page, left: null });
	const rightPage = $derived(pair.right);
	const leftPage = $derived(pair.left);
	const rightBoxes = $derived(index.byPage.get(rightPage) ?? []);
	const leftBoxes = $derived(leftPage !== null ? (index.byPage.get(leftPage) ?? []) : []);
	const currentSura = $derived(rightBoxes[0]?.sura_number);
	const currentPara = $derived(index.paraOf(rightPage));
	const url = (p: number) => `${edition.pagesBaseUrl}/qm${p}.${edition.ext}`;

	const bounds = $derived(computeBounds(width, height, edition.width, edition.height, barsVisible, leftPage !== null));
	const same = $derived(!!(selected && audio.active && selected.sura === audio.active.sura && selected.ayah === audio.active.ayah));
	const highlightFor = (boxes: AyahBox[]) => (same ? boxesFor(boxes, selected) : [...boxesFor(boxes, selected), ...boxesFor(boxes, audio.active)]);
	const menu = $derived.by(() => {
		if (!selected || !bounds) return null;
		const onRight = boxesFor(rightBoxes, selected).length > 0;
		return menuAnchor(bounds, boxesFor(onRight ? rightBoxes : leftBoxes, selected), onRight, edition.height, scale, height);
	});

	function goTo(p: number) {
		const n = Math.max(1, Math.min(edition.totalPages, p));
		page = n;
		selected = null;
		try {
			localStorage.setItem(`mushaf_${edition.id}`, String(n));
		} catch {
			/* storage unavailable */
		}
		const next = new URL(window.location.href);
		next.searchParams.set('page', String(n));
		void goto(next, { replace: true, shallow: true, reset: false });
	}
	const step = $derived(spread ? 2 : 1);
	const prev = () => goTo(page - step);
	const next = () => goTo(page + step);
	function goToAyah(sura: number, ayah: number) {
		const target = index.ayahFirstPage.get(`${sura}:${ayah}`);
		if (target === undefined) return;
		goTo(target);
		selected = { sura, ayah };
	}
	function toggleDrawer() {
		if (!drawerOpen) {
			if (currentSura) navSurah = currentSura;
			if (currentPara) navPara = currentPara;
		}
		drawerOpen = !drawerOpen;
	}
	function openTilawat() {
		tilawatSura = currentSura ?? 1;
		tilawatOpen = true;
	}
	function tap(e: MouseEvent, boxes: AyahBox[]) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * edition.width;
		const y = ((e.clientY - rect.top) / rect.height) * edition.height;
		const hit = boxes.find((b) => x >= b.min_x && x <= b.max_x && y >= b.min_y && y <= b.max_y);
		if (hit) selected = selected?.sura === hit.sura_number && selected?.ayah === hit.ayah_number ? null : { sura: hit.sura_number, ayah: hit.ayah_number };
		else if (selected) selected = null;
		else barsVisible = !barsVisible;
	}
	function toggleBookmark() {
		mushafBookmarks.toggle({ editionId: edition.id, page: rightPage, sura: currentSura ?? 1, para: currentPara });
	}
	function onKey(e: KeyboardEvent) {
		if (drawerOpen || (e.target as HTMLElement).tagName === 'INPUT') return;
		// RTL: left arrow = forward.
		if (e.key === 'ArrowLeft') next();
		else if (e.key === 'ArrowRight') prev();
		else if (e.key === 'Escape') {
			selected = null;
			drawerOpen = false;
		}
	}
	function touchEnd(e: TouchEvent) {
		if (touchX === null || scale > 1) return;
		const delta = e.changedTouches[0].clientX - touchX;
		// RTL: swipe right = forward, like flipping a mushaf page.
		if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
		touchX = null;
	}

	onMount(() => {
		void index.load(edition.id);
		// Resume where this device last left off in this edition.
		const saved = Number(localStorage.getItem(`mushaf_${edition.id}`));
		if (saved) page = Math.max(1, Math.min(edition.totalPages, saved));
	});

	$effect(() => preloadAround(page, spread, edition.totalPages, url));
</script>

<svelte:window onkeydown={onKey} />

<div
	role="application"
	bind:clientWidth={width}
	bind:clientHeight={height}
	ontouchstart={(e) => (touchX = e.touches[0].clientX)}
	ontouchend={touchEnd}
	class="relative h-full w-full overflow-hidden select-none bg-gradient-to-b from-neutral-200 via-neutral-300 to-neutral-400 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950"
>
	{#if bounds}
		<div
			class="absolute transition-transform duration-200"
			style:left="{bounds.x}px"
			style:top="{bounds.y}px"
			style:width="{bounds.w}px"
			style:height="{bounds.h}px"
			style:transform="scale({scale})"
			style:transform-origin="center center"
		>
			{#if bounds.showSpread && leftPage !== null}
				<div class="flex w-full h-full">
					<PageFace
						class="w-1/2 h-full order-1"
						pageNum={leftPage}
						url={url(leftPage)}
						highlight={highlightFor(leftBoxes)}
						editionWidth={edition.width}
						editionHeight={edition.height}
						onclick={(e) => tap(e, leftBoxes)}
					/>
					<PageFace
						class="w-1/2 h-full order-2"
						pageNum={rightPage}
						url={url(rightPage)}
						highlight={highlightFor(rightBoxes)}
						editionWidth={edition.width}
						editionHeight={edition.height}
						onclick={(e) => tap(e, rightBoxes)}
					/>
				</div>
			{:else}
				<PageFace
					class="w-full h-full"
					pageNum={rightPage}
					url={url(rightPage)}
					highlight={highlightFor(rightBoxes)}
					editionWidth={edition.width}
					editionHeight={edition.height}
					onclick={(e) => tap(e, rightBoxes)}
				/>
			{/if}
		</div>
	{/if}

	<MushafTopBar
		title={edition.title}
		sura={currentSura}
		visible={barsVisible}
		{drawerOpen}
		{scale}
		{spread}
		ontoggleDrawer={toggleDrawer}
		onlisten={openTilawat}
		onzoom={(d) => (scale = Math.min(3, Math.max(0.75, +(scale + d * 0.25).toFixed(2))))}
		onspread={() => spreadStore.set(spread ? '0' : '1')}
	/>

	<div
		class={cn(
			'absolute bottom-4 inset-x-0 z-30 flex items-center justify-center flex-wrap gap-3 px-3 transition-all duration-300',
			barsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-2'
		)}
	>
		<AudioPill {audio} onrange={openTilawat} />
		<PageNav
			{page}
			{rightPage}
			{leftPage}
			totalPages={edition.totalPages}
			bookmarked={mushafBookmarks.all.some((b) => b.editionId === edition.id && b.page === rightPage)}
			onprev={prev}
			onnext={next}
			ongoto={goTo}
			onbookmark={toggleBookmark}
		/>
	</div>

	{#if !barsVisible}
		<button
			type="button"
			onclick={() => (barsVisible = true)}
			title={t('exitFullscreen')}
			aria-label={t('exitFullscreen')}
			class="absolute bottom-4 right-4 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-xl text-foreground hover:bg-muted transition-colors"
			><Minimize class="w-4.5 h-4.5" /></button
		>
	{/if}

	{#if selected && menu}
		<AyahMenu
			sura={selected.sura}
			ayah={selected.ayah}
			top={menu.top}
			left={menu.left}
			playing={same && audio.playing}
			onplay={() => {
				const s = selected!;
				selected = null;
				audio.playSingle(s.sura, s.ayah);
			}}
			onfullscreen={() => {
				barsVisible = false;
				selected = null;
				drawerOpen = false;
			}}
			ondone={() => (selected = null)}
		/>
	{/if}

	<MushafDrawer
		open={drawerOpen}
		{index}
		editionId={edition.id}
		{navSurah}
		{navPara}
		currentAyah={selected}
		visiblePages={leftPage !== null ? [rightPage, leftPage] : [rightPage]}
		onsurah={(s) => (navSurah = s)}
		onpara={(p) => (navPara = p)}
		ongoAyah={goToAyah}
		ongoPage={goTo}
	/>

	{#if tilawatOpen}
		<TilawatDialog
			onclose={() => (tilawatOpen = false)}
			surahNumber={tilawatSura}
			totalAyahs={AYAH_COUNTS[tilawatSura - 1]}
			defaultEnd="all"
			allSurahs={SURA_NAMES.map((name, i) => ({ number: i + 1, nameBengali: name, totalAyahs: AYAH_COUNTS[i] }) as QuranSurah)}
			{reciters}
			{reciterId}
			loading={audio.loading}
			onsurah={(n) => (tilawatSura = n)}
			onreciter={prefs.setReciter}
			onstart={(s, e, r) => audio.startRange(tilawatSura, s, e, r)}
		/>
	{/if}
</div>
