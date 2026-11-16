<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Compass from '@lucide/svelte/icons/compass';
	import Landmark from '@lucide/svelte/icons/landmark';
	import Clock from '@lucide/svelte/icons/clock';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import { MediaQuery } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { loc } from '#lib/location.svelte.ts';
	import { apiGet } from '#lib/client-api.ts';
	import { toHijri } from '#lib/calendar.ts';
	import { getHijriForDate, getHijriToday, type HijriDisplayDate } from '#lib/hijri.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { calcPrayerSlots, findActiveSlot } from '#lib/prayer-times.ts';
	import type { NamazTimeDetail, NamazTimeListItem } from '#lib/types.ts';
	import DatePicker from './DatePicker.svelte';
	import NamazDetailPanel from './NamazDetailPanel.svelte';
	import NamazHero from './NamazHero.svelte';
	import PrayerRow from './PrayerRow.svelte';
	import { createSlotLinker } from './slot-link.ts';

	let { namazTimes }: { namazTimes: NamazTimeListItem[] } = $props();

	const t = useT('NamazTimesPage');
	const tNav = useT('Nav');
	const locale = $derived(currentLocale());
	const desktop = new MediaQuery('min-width: 1024px', false);
	const linker = $derived(createSlotLinker(namazTimes));

	// Prayer times depend on the visitor's clock and settings, so they are computed after mount only.
	let mounted = $state(false);
	const coords = $derived(loc.place);
	let now = $state(new Date());
	let hijriState = $state<HijriDisplayDate | null>(null);
	// A day chosen in the calendar replaces the live clock for the date and the times; today's countdown stops.
	let picked = $state<Date | null>(null);
	let pickedHijri = $state<HijriDisplayDate | null>(null);
	let pickerOpen = $state(false);
	let selectedId = $state<string | null>(null);
	let fetched = $state<{ id: string; data: NamazTimeDetail | null } | null>(null);

	const viewDate = $derived(picked ?? now);
	const slots = $derived(mounted ? calcPrayerSlots(coords.lat, coords.lng, viewDate) : null);
	const activeKey = $derived(slots && !picked ? findActiveSlot(slots, now) : null);
	const hijri = $derived<HijriDisplayDate>(picked ? (pickedHijri ?? { ...toHijri(picked), source: 'local' }) : (hijriState ?? { ...toHijri(now), source: 'local' }));

	// Default selection on desktop (where a panel is waiting): the running slot's page, else the first linkable one.
	const defaultId = $derived.by(() => {
		const active = slots?.find((s) => s.key === activeKey);
		return (active && linker(active)) ?? slots?.map(linker).find(Boolean) ?? null;
	});
	const effectiveId = $derived(selectedId ?? (desktop.current ? defaultId : null));
	const detail = $derived(fetched && fetched.id === effectiveId ? fetched.data : null);
	const detailLoading = $derived(effectiveId !== null && fetched?.id !== effectiveId);

	/** A geolocated fix carries no country; the last one resolved is remembered (Bangladesh when none). */
	function countryOf() {
		try {
			return localStorage.getItem('ij_country_code') || 'BD';
		} catch {
			return 'BD';
		}
	}

	onMount(() => {
		mounted = true;
		const tick = setInterval(() => (now = new Date()), 60000);
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
		const day = picked;
		pickedHijri = null;
		if (!day) return;
		let cancelled = false;
		getHijriForDate(day, coords.country ?? countryOf()).then((h) => !cancelled && (pickedHijri = h));
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
	<div class="w-full lg:max-w-md lg:shrink-0 lg:min-h-0 lg:overflow-hidden lg:flex lg:flex-col">
		<div class="relative">
			<NamazHero {hijri} now={viewDate} />
			<button
				type="button"
				class="absolute right-3 bottom-7 lg:bottom-[calc(1.4vh+0.75rem)] inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1.5 text-sm font-semibold text-primary-foreground dark:text-foreground transition-colors"
				aria-expanded={pickerOpen}
				onclick={() => (pickerOpen = !pickerOpen)}
			>
				<CalendarDays class="w-4 h-4" />{picked ? t('anotherDay') : t('pickDate')}
			</button>
			{#if pickerOpen}
				<div class="absolute right-0 top-full z-30 -mt-2">
					<DatePicker
						value={viewDate}
						country={coords.country ?? countryOf()}
						onpick={(d) => {
							const today = new Date();
							picked = d.toDateString() === today.toDateString() ? null : d;
							pickerOpen = false;
						}}
					/>
				</div>
			{/if}
		</div>

		<div class="flex gap-2 mb-3 lg:mb-[1vh] lg:shrink-0">
			{#each [['/qibla', Compass, 'qibla'], ['/mosques', Landmark, 'mosques']] as const as [href, Icon, key] (href)}
				<a href={localePath(href, locale)} class="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
					<Icon class="w-4 h-4" />{tNav(key)}
				</a>
			{/each}
		</div>

		{#if !slots}
			<div class="flex flex-col items-center py-20 gap-3 text-muted-foreground">
				<Loader2 class="w-8 h-8 animate-spin text-primary" />
				<p class="text-base">{t('calculating')}</p>
			</div>
		{:else}
			<div class="space-y-2 lg:space-y-0 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col lg:gap-[0.8vh]">
				{#each slots as slot (slot.key)}
					{@const detailId = linker(slot)}
					{@const row = { slot, active: activeKey === slot.key, selected: desktop.current && !!detailId && effectiveId === detailId, linkable: !!detailId, now }}
					{#if detailId}
						<!-- Desktop has a detail pane right there: fill it in instead of navigating away. -->
						<a
							class="lg:flex-1 lg:min-h-0 lg:flex"
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
						<div class="lg:flex-1 lg:min-h-0 lg:flex"><PrayerRow {...row} /></div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<div class="hidden lg:flex lg:flex-1 lg:min-w-0 lg:min-h-0">
		<NamazDetailPanel hasSelection={effectiveId !== null} loading={detailLoading} {detail} />
	</div>
</div>
