<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import { MediaQuery } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { apiGet } from '#lib/client-api.ts';
	import { toHijri } from '#lib/calendar.ts';
	import { getHijriToday, type HijriDisplayDate } from '#lib/hijri.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { calcPrayerSlots, findActiveSlot } from '#lib/prayer-times.ts';
	import type { NamazTimeDetail, NamazTimeListItem } from '#lib/types.ts';
	import NamazDetailPanel from './NamazDetailPanel.svelte';
	import NamazHero from './NamazHero.svelte';
	import PrayerRow from './PrayerRow.svelte';
	import { createSlotLinker } from './slot-link.ts';

	interface Coords {
		lat: number;
		lng: number;
		/** Only the Dhaka default pins a country; a geolocated fix is resolved by coordinates alone. */
		country?: string;
	}
	const DHAKA: Coords = { lat: 23.8103, lng: 90.4125, country: 'BD' };

	let { namazTimes }: { namazTimes: NamazTimeListItem[] } = $props();

	const t = useT('NamazTimesPage');
	const locale = $derived(currentLocale());
	const desktop = new MediaQuery('min-width: 1024px', false);
	const linker = $derived(createSlotLinker(namazTimes));

	// Prayer times depend on the visitor's clock and settings, so they are computed after mount only.
	let mounted = $state(false);
	let coords = $state<Coords>(DHAKA);
	let now = $state(new Date());
	// svelte-ignore state_referenced_locally
	let location = $state(t('defaultLocation'));
	let geoDone = $state(false);
	let hijriState = $state<HijriDisplayDate | null>(null);
	let selectedId = $state<string | null>(null);
	let fetched = $state<{ id: string; data: NamazTimeDetail | null } | null>(null);

	const slots = $derived(mounted ? calcPrayerSlots(coords.lat, coords.lng, now) : null);
	const activeKey = $derived(slots ? findActiveSlot(slots, now) : null);
	const locating = $derived(!geoDone && (!mounted || 'geolocation' in navigator));
	const hijri = $derived<HijriDisplayDate>(hijriState ?? { ...toHijri(now), source: 'local' });

	// Default selection on desktop (where a panel is waiting): the running slot's page, else the first linkable one.
	const defaultId = $derived.by(() => {
		const active = slots?.find((s) => s.key === activeKey);
		return (active && linker(active)) ?? slots?.map(linker).find(Boolean) ?? null;
	});
	const effectiveId = $derived(selectedId ?? (desktop.current ? defaultId : null));
	const detail = $derived(fetched && fetched.id === effectiveId ? fetched.data : null);
	const detailLoading = $derived(effectiveId !== null && fetched?.id !== effectiveId);

	onMount(() => {
		mounted = true;
		const tick = setInterval(() => (now = new Date()), 60000);
		navigator.geolocation?.getCurrentPosition(
			(pos) => {
				coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
				now = new Date();
				fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=${locale}`)
					.then((r) => r.json())
					.then((d) => {
						const city = d.address?.city || d.address?.town || d.address?.county || d.address?.state;
						const name = [city, d.address?.country].filter(Boolean).join(', ');
						if (name) location = name;
					})
					.catch(() => {});
				geoDone = true;
			},
			() => (geoDone = true),
			{ timeout: 6000 }
		);
		return () => clearInterval(tick);
	});

	// Sighting-aware date from the API; the local tabular date renders meanwhile. A slow default-location
	// answer never overwrites a later geolocated one.
	$effect(() => {
		const { lat, lng, country } = coords;
		let cancelled = false;
		getHijriToday(lat, lng, country).then((h) => !cancelled && (hijriState = h));
		return () => (cancelled = true);
	});

	$effect(() => {
		const id = effectiveId;
		if (!id) return;
		const ac = new AbortController();
		apiGet<NamazTimeDetail>(`/api/namaz-times/${id}`, ac.signal).then((data) => !ac.signal.aborted && (fetched = { id, data }));
		return () => ac.abort();
	});
</script>

<div class="flex flex-col lg:flex-row gap-6 lg:items-stretch lg:flex-1 lg:min-h-0">
	<div class="w-full lg:max-w-md lg:shrink-0 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
		<NamazHero {hijri} {now} {location} {locating} />

		{#if !slots}
			<div class="flex flex-col items-center py-20 gap-3 text-muted-foreground">
				<Loader2 class="w-8 h-8 animate-spin text-primary" />
				<p class="text-base">{t('calculating')}</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each slots as slot (slot.key)}
					{@const detailId = linker(slot)}
					{@const row = { slot, active: activeKey === slot.key, selected: desktop.current && !!detailId && effectiveId === detailId, linkable: !!detailId, now }}
					{#if detailId}
						<!-- Desktop has a detail pane right there: fill it in instead of navigating away. -->
						<a
							href={localePath(`/namaz-times/${detailId}`, locale)}
							data-sveltekit-preload-data="off"
							onclick={(e) => {
								if (desktop.current) {
									e.preventDefault();
									selectedId = detailId;
								}
							}}
						>
							<PrayerRow {...row} />
						</a>
					{:else}
						<div><PrayerRow {...row} /></div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<div class="hidden lg:flex lg:flex-1 lg:min-w-0 lg:min-h-0">
		<NamazDetailPanel hasSelection={effectiveId !== null} loading={detailLoading} {detail} />
	</div>
</div>
