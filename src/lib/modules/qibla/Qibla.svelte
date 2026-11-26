<script lang="ts">
	import { Coordinates, Qibla } from 'adhan';
	import LocationButton from '#lib/components/shared/LocationButton.svelte';
	import { formatNum } from '#lib/calendar.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { loc } from '#lib/location.svelte.ts';
	import { onDestroy } from 'svelte';
	import Navigation from '@lucide/svelte/icons/navigation';
	import { createCompass } from './compass.svelte.ts';
	import KaabaMarker from './KaabaMarker.svelte';

	const t = useT('QiblaPage');
	const locale = $derived(currentLocale());

	const KAABA = { lat: 21.4225, lng: 39.8262 };
	const rad = (d: number) => (d * Math.PI) / 180;

	// Bearing from true north, clockwise, along the great circle to the Kaaba.
	const bearing = $derived(Math.round(Qibla(new Coordinates(loc.place.lat, loc.place.lng))));
	const km = $derived.by(() => {
		const { lat, lng } = loc.place;
		const a = Math.sin(rad(KAABA.lat - lat) / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(KAABA.lat)) * Math.sin(rad(KAABA.lng - lng) / 2) ** 2;
		return Math.round(12742 * Math.asin(Math.sqrt(a)));
	});
	const points = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
	const compass = $derived(points[Math.round(bearing / 45) % 8]);
	const live = createCompass();
	onDestroy(live.stop);
	/** Degrees the Qibla is to the right (+) or left (-) of where the phone points. */
	const delta = $derived(live.heading === null ? null : ((bearing - live.heading + 540) % 360) - 180);
	const aligned = $derived(delta !== null && Math.abs(delta) <= 4);
	$effect(() => {
		if (aligned) navigator.vibrate?.(60);
	});
	const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
</script>

<div class="max-w-xl mx-auto px-4 py-8">
	<div class="flex items-start justify-between gap-4 mb-6">
		<h1 class="text-2xl font-bold text-foreground">{t('heading')}</h1>
		<LocationButton class="text-sm text-muted-foreground hover:text-foreground" />
	</div>

	<div class="rounded-3xl border border-border bg-card p-6 sm:p-8 text-center">
		<svg viewBox="-136 -162 272 298" class="w-full max-w-72 mx-auto" role="img" aria-label={t('diagramLabel', { degrees: bearing })}>
			<!-- With the compass on, the top is where the phone points, so the Kaaba there is the target the arrow is turned
			     to. Without it north is up, and a Kaaba there would say the Qibla is north. -->
			{#if live.status === 'live'}
				<KaabaMarker />
			{:else}
				<polygon points="0,-122 -7,-136 7,-136" class="fill-foreground" />
			{/if}
			<g transform="rotate({-(live.angle ?? 0)})">
				<circle r="104" class="fill-muted/40 stroke-border" stroke-width="1" />
				{#each ticks as a (a)}
					<line y1="-100" y2={a % 45 === 0 ? -90 : -96} transform="rotate({a})" class="stroke-muted-foreground/60" stroke-width={a % 90 === 0 ? 2 : 1} />
				{/each}
				{#each [['N', 0], ['E', 90], ['S', 180], ['W', 270]] as [name, a] (name)}
					<text
						x={Math.round(115 * Math.sin(rad(Number(a))))}
						y={Math.round(-115 * Math.cos(rad(Number(a))))}
						text-anchor="middle"
						dominant-baseline="middle"
						class="fill-muted-foreground text-[12px] font-semibold">{name}</text
					>
				{/each}
				<g transform="rotate({bearing})">
					<line y1="8" y2="-72" class="stroke-primary" stroke-width="4" stroke-linecap="round" />
					<polygon points="0,-88 -9,-68 9,-68" class="fill-primary" />
				</g>
			</g>
			<circle r="6" class="fill-primary" />
		</svg>

		<div class="mt-5 min-h-12" aria-live="polite">
			{#if live.status === 'live'}
				<p class="text-base font-semibold {aligned ? 'text-primary' : 'text-muted-foreground'}">
					{#if aligned}{t('facing')}{:else if delta !== null}{t(delta > 0 ? 'turnRight' : 'turnLeft', { degrees: formatNum(Math.round(Math.abs(delta)), locale) })}{/if}
				</p>
			{:else if live.status === 'denied'}
				<p class="text-sm text-destructive">{t('compassDenied')}</p>
			{:else if live.status === 'unsupported'}
				<p class="text-sm text-muted-foreground">{t('compassUnsupported')}</p>
			{:else}
				<button
					type="button"
					onclick={live.start}
					disabled={live.status === 'starting'}
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
				>
					<Navigation class="w-4 h-4" />{t('useCompass')}
				</button>
			{/if}
		</div>

		<p class="mt-4 text-5xl font-bold tabular-nums text-foreground">{formatNum(bearing, locale)}°</p>
		<p class="mt-1 text-base text-muted-foreground">{t('fromNorth', { direction: t(`dir_${compass}`) })}</p>
		<p class="mt-4 text-sm text-muted-foreground">{t('distance', { km: formatNum(km, locale) })}</p>
	</div>

	<ul class="mt-6 space-y-2 text-sm text-muted-foreground list-disc ps-5">
		<li>{t('tip1')}</li>
		<li>{t('tip2')}</li>
	</ul>
</div>
