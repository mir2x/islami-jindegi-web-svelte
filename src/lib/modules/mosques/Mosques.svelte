<script lang="ts">
	import LocateFixed from '@lucide/svelte/icons/locate-fixed';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import { onMount } from 'svelte';
	import LocationButton from '#lib/components/shared/LocationButton.svelte';
	import { formatNum } from '#lib/calendar.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { loc } from '#lib/location.svelte.ts';
	import type { Mosque } from '#lib/types/mosques.ts';
	import { cn } from '#lib/utils.ts';
	import { distanceM, displayName, type Point } from './geo.ts';
	import MosqueDetail from './MosqueDetail.svelte';
	import MosqueList from './MosqueList.svelte';
	import type MosqueMap from './MosqueMap.svelte';

	const RADII = [1, 3, 5, 10];
	/** How close the map is zoomed for each radius, so the searched circle roughly fills it. */
	const ZOOM: Record<number, number> = { 1: 15, 3: 14, 5: 13, 10: 12 };
	/** The list and the map stop here: a dense city centre can hold far more, and nobody scrolls that. */
	const MAX_SHOWN = 300;
	const MINE_KEY = 'ij_my_mosque';

	const t = useT('MosquesPage');
	const locale = $derived(currentLocale());

	let radius = $state(5);
	/** Where "search this area" moved the search to; `null` means the visitor's own place. */
	let anchor = $state<Point | null>(null);
	const center = $derived<Point>(anchor ?? loc.place);
	let view = $state<Point>(loc.place);
	let mosques = $state<Mosque[]>([]);
	let loading = $state(true);
	let failed = $state(false);
	let attempt = $state(0);
	let query = $state('');
	let selectedId = $state<string | null>(null);
	let mine = $state<Mosque | null>(null);
	let map = $state<MosqueMap>();

	onMount(() => {
		try {
			mine = JSON.parse(localStorage.getItem(MINE_KEY) ?? 'null');
		} catch {
			/* no favourite */
		}
	});

	// A new place of the visitor's own drops any area they had searched.
	$effect(() => {
		void loc.place;
		anchor = null;
	});

	// Previous results stay on screen while the next ones load, so changing the radius does not blank the page.
	$effect(() => {
		const { lat, lng } = center;
		const r = radius;
		void attempt;
		const ac = new AbortController();
		loading = true;
		failed = false;
		fetch(`/api/mosques?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&radius=${r}`, { signal: ac.signal })
			.then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
			.then((d: { mosques: Mosque[] }) => {
				mosques = d.mosques;
				loading = false;
			})
			.catch(() => {
				if (ac.signal.aborted) return;
				failed = true;
				loading = false;
			});
		return () => ac.abort();
	});

	const rows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const all = mosques
			.map((mosque) => ({ mosque, meters: distanceM(center, mosque) }))
			.filter(({ mosque, meters }) => meters <= radius * 1000 && mosque.id !== mine?.id)
			.filter(({ mosque }) => !q || [mosque.name, mosque.nameBn, mosque.nameEn, mosque.address].some((v) => v.toLowerCase().includes(q)))
			.sort((a, b) => a.meters - b.meters)
			.slice(0, MAX_SHOWN);
		// The visitor's own mosque is always first, even when it lies outside the searched radius.
		return mine ? [{ mosque: mine, meters: distanceM(center, mine) }, ...all] : all;
	});
	const shown = $derived(rows.map((r) => r.mosque));
	const selected = $derived(shown.find((m) => m.id === selectedId) ?? null);
	const searchHere = $derived(distanceM(view, center) > Math.max(400, radius * 300));

	function toggleMine(m: Mosque) {
		mine = mine?.id === m.id ? null : m;
		try {
			if (mine) localStorage.setItem(MINE_KEY, JSON.stringify(mine));
			else localStorage.removeItem(MINE_KEY);
		} catch {
			/* kept for this visit only */
		}
	}

	const chip = (on: boolean) =>
		cn(
			'px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors',
			on ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'
		);
	const floating = 'rounded-full bg-card text-foreground border border-border shadow-md px-3.5 py-2 text-sm font-semibold hover:bg-muted transition-colors';
</script>

<div class="max-w-7xl mx-auto w-full px-4 py-4 flex flex-col gap-3">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold text-foreground">{t('heading')}</h1>
		<LocationButton class="text-sm text-muted-foreground hover:text-foreground" />
	</div>

	<div class="flex flex-wrap items-center gap-2">
		{#each RADII as r (r)}
			<button type="button" class={chip(radius === r)} aria-pressed={radius === r} onclick={() => (radius = r)}>{t('radius', { km: formatNum(r, locale) })}</button>
		{/each}
		<label class="relative ms-auto w-full sm:w-64">
			<Search class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<input
				type="search"
				bind:value={query}
				placeholder={t('searchPlaceholder')}
				class="w-full h-10 ps-9 pe-3 rounded-full border border-border bg-background text-sm text-foreground"
			/>
		</label>
	</div>

	<p class="text-sm text-muted-foreground" aria-live="polite">
		{#if failed}{t('failed')}{:else if loading && !mosques.length}{t('loading')}{:else}{t('count', { n: formatNum(rows.length, locale), km: formatNum(radius, locale) })}{/if}
	</p>

	<div class="flex flex-col lg:flex-row gap-4 lg:h-[calc(100dvh-15.5rem)] lg:min-h-96">
		<section class="relative h-[44dvh] lg:h-auto lg:flex-1 order-1 lg:order-2 rounded-2xl overflow-hidden border border-border bg-muted">
			{#await import('./MosqueMap.svelte') then { default: Map }}
				<Map
					bind:this={map}
					{center}
					you={loc.place.source === 'default' ? null : loc.place}
					mosques={shown}
					selectedId={selected?.id ?? null}
					zoom={ZOOM[radius]}
					attribution={t('attribution')}
					onselect={(id) => (selectedId = id)}
					onmoved={(c) => (view = c)}
				/>
			{/await}
			<div class="absolute inset-x-0 top-3 flex justify-center pointer-events-none z-[500]">
				{#if searchHere}
					<button type="button" class="{floating} pointer-events-auto" onclick={() => (anchor = view)}>{t('searchHere')}</button>
				{/if}
			</div>
			<div class="absolute right-3 bottom-8 flex flex-col gap-2 z-[500]">
				{#if loading}<span class="{floating} inline-flex items-center justify-center"><Loader2 class="w-4 h-4 animate-spin text-primary" /></span>{/if}
				<button
					type="button"
					class="{floating} inline-flex items-center justify-center !px-2.5"
					aria-label={t('recenter')}
					title={t('recenter')}
					onclick={() => {
						anchor = null;
						map?.recenter();
					}}
				>
					<LocateFixed class="w-5 h-5" />
				</button>
			</div>
		</section>

		<section class="lg:w-[26rem] lg:shrink-0 order-2 lg:order-1 lg:min-h-0 lg:overflow-y-auto rounded-2xl border border-border bg-card">
			{#if selected}
				<MosqueDetail mosque={selected} isMine={mine?.id === selected.id} onclose={() => (selectedId = null)} ontoggleMine={() => toggleMine(selected)} />
			{:else if failed}
				<div class="p-6 text-center space-y-3">
					<p class="text-sm text-muted-foreground">{t('failed')}</p>
					<button type="button" class={chip(true)} onclick={() => attempt++}>{t('retry')}</button>
				</div>
			{:else if rows.length}
				<MosqueList {rows} {selectedId} mineId={mine?.id ?? null} onselect={(id) => (selectedId = id)} />
			{:else if !loading}
				<p class="p-6 text-center text-sm text-muted-foreground">{query ? t('noMatches') : t('none')}</p>
			{/if}
		</section>
	</div>
</div>
