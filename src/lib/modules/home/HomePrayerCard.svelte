<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { onMount } from 'svelte';
	import { formatNum, formatTime, toBanglaDate, toHijri } from '#lib/calendar.ts';
	import { getHijriToday, type HijriDisplayDate } from '#lib/hijri.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { calcPrayerSlots, findActiveSlot, findNextSlot } from '#lib/prayer-times.ts';
	import { cn } from '#lib/utils.ts';

	const DHAKA = { lat: 23.8103, lng: 90.4125 };

	const t = useT('Home');
	const tCommon = useT('Common');
	const locale = $derived(currentLocale());
	const days = $derived(t.raw<string[]>('days'));
	const months = $derived(t.raw<string[]>('months'));
	const seasons = $derived(t.raw<string[]>('seasons'));

	// Prayer times depend on the visitor's clock, so the card renders after mount only. It starts on the
	// Dhaka default straight away; geolocation refines it if granted.
	let mounted = $state(false);
	let coords = $state(DHAKA);
	let now = $state(new Date());
	let located = $state<string | null>(null);
	let hijriState = $state<HijriDisplayDate | null>(null);

	const slots = $derived(mounted ? calcPrayerSlots(coords.lat, coords.lng, now) : []);
	const active = $derived(slots.find((s) => s.key === findActiveSlot(slots, now)));
	const next = $derived(findNextSlot(slots, now));
	const locationName = $derived(located ?? t('dhakaLocation'));
	const hijri = $derived<HijriDisplayDate>(hijriState ?? { ...toHijri(now), source: 'local' });
	const bangla = $derived(toBanglaDate(now));

	onMount(() => {
		mounted = true;
		const tick = setInterval(() => (now = new Date()), 60000);
		let cancelled = false;
		navigator.geolocation?.getCurrentPosition(
			(p) => {
				coords = { lat: p.coords.latitude, lng: p.coords.longitude };
				now = new Date();
				located = t('yourLocation');
				// Refine the placeholder label to "City, Country" once reverse geocoding resolves.
				fetch(`https://nominatim.openstreetmap.org/reverse?lat=${p.coords.latitude}&lon=${p.coords.longitude}&format=json&accept-language=${locale}`)
					.then((r) => r.json())
					.then((d) => {
						const city = d.address?.city || d.address?.town || d.address?.county || d.address?.state;
						const name = [city, d.address?.country].filter(Boolean).join(', ');
						if (!cancelled && name) located = name;
					})
					.catch(() => {});
			},
			() => {},
			{ timeout: 5000 }
		);
		return () => {
			cancelled = true;
			clearInterval(tick);
		};
	});

	// Sighting-aware Hijri date from the API; a slow default-location answer never overwrites a later one.
	$effect(() => {
		const { lat, lng } = coords;
		const country = lat === DHAKA.lat && lng === DHAKA.lng ? 'BD' : undefined;
		let cancelled = false;
		getHijriToday(lat, lng, country).then((h) => !cancelled && (hijriState = h));
		return () => (cancelled = true);
	});

	const iconBtn =
		'inline-flex items-center justify-center rounded-lg border border-foreground/25 text-foreground/60 group-hover:border-primary/60 group-hover:text-primary transition-colors shrink-0';
	const label = 'text-xs lg:text-sm text-foreground/60 dark:text-white/60';
	const href = $derived(localePath('/namaz-times', locale));
</script>

{#if !mounted}
	<div class="rounded-2xl bg-card dark:bg-[#163f4f] border border-foreground/15 shadow-sm px-5 py-4 flex items-center gap-3 text-muted-foreground shrink-0 w-full">
		<Loader2 class="w-4 h-4 animate-spin shrink-0 text-primary" /><span class="text-sm">{tCommon('loading')}</span>
	</div>
{:else}
	<div class="shrink-0 w-full flex flex-col gap-3 lg:gap-4">
		<!-- Dates: a plain left-aligned masthead, no card (matches the app) -->
		<a {href} class="group block px-1">
			<h2 class="flex items-center gap-2.5 text-2xl sm:text-3xl font-bold text-primary dark:text-white leading-snug">
				<span>{formatNum(hijri.day, locale)} {locale === 'bn' ? hijri.monthBn : hijri.monthEn}, {formatNum(hijri.year, locale)} {t('hijriSuffix')}</span>
				<span class={cn(iconBtn, 'w-8 h-8')}><Calendar class="w-4 h-4" /></span>
			</h2>
			<p class="mt-1.5 flex items-center gap-2.5 text-base sm:text-lg text-foreground/80 dark:text-white/80 font-semibold">
				<span>{days[now.getDay()]}, {formatNum(now.getDate(), locale)} {months[now.getMonth()]}, {formatNum(now.getFullYear(), locale)}</span>
				<span class={cn(iconBtn, 'w-7 h-7')}><Calendar class="w-3.5 h-3.5" /></span>
			</p>
			<p class="mt-1 text-base sm:text-lg text-foreground/70 dark:text-white/70">
				{formatNum(bangla.day, locale)}
				{locale === 'bn' ? bangla.monthBn : bangla.monthEn}, {formatNum(bangla.year, locale)}
				{seasons[bangla.monthIdx] ?? ''}
			</p>
			<p class="mt-1.5 flex items-center gap-2.5 text-base sm:text-lg text-foreground/70 dark:text-white/70">
				<span>{locationName}</span><span class={cn(iconBtn, 'w-7 h-7')}><MapPin class="w-3.5 h-3.5" /></span>
			</p>
		</a>

		<!-- Prayer times: one full-width card, current | next columns -->
		<a
			{href}
			class="group rounded-2xl bg-card dark:bg-[#163f4f] border border-border/60 dark:border-foreground/15 shadow-sm hover:border-primary/50 hover:shadow-md transition-all p-4 lg:p-5 flex items-start justify-between gap-4"
		>
			<div class="min-w-0">
				<p class="text-sm lg:text-base font-semibold text-primary dark:text-amber-300">{t('current')}</p>
				{#if active}
					<p class="mt-0.5 text-xl lg:text-2xl font-semibold text-foreground dark:text-white leading-snug">{locale === 'bn' ? active.nameBn : active.nameEn}</p>
					<div class="mt-2 flex items-end gap-5 lg:gap-6">
						<div>
							<p class={label}>{t('start')}</p>
							<p class="text-lg lg:text-xl font-medium tabular-nums text-foreground/80 dark:text-white/80">{formatTime(active.start, locale)}</p>
						</div>
						<div>
							<p class={label}>{t('end')}</p>
							<p class="text-xl lg:text-2xl font-semibold tabular-nums text-foreground dark:text-white">{formatTime(active.end, locale)}</p>
						</div>
					</div>
				{:else}<p class="mt-1 text-base text-muted-foreground">—</p>{/if}
			</div>
			{#if next}
				<div class="text-right shrink-0">
					<p class="text-sm lg:text-base font-semibold text-primary dark:text-amber-300">{t('next')}</p>
					<p class="mt-0.5 text-lg lg:text-xl font-semibold text-foreground dark:text-white leading-snug">{locale === 'bn' ? next.nameBn : next.nameEn}</p>
					<div class="mt-2">
						<p class={label}>{t('start')}</p>
						<p class="text-lg lg:text-xl font-medium tabular-nums text-foreground/80 dark:text-white/80">{formatTime(next.start, locale)}</p>
					</div>
				</div>
			{/if}
		</a>
	</div>
{/if}
