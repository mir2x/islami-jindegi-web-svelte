<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { formatNum, toBanglaDate } from '#lib/calendar.ts';
	import type { HijriDisplayDate } from '#lib/hijri.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';

	interface Props {
		hijri: HijriDisplayDate;
		now: Date;
		location: string;
		locating: boolean;
	}
	let { hijri, now, location, locating }: Props = $props();

	const t = useT('NamazTimesPage');
	const tHome = useT('Home');
	const locale = $derived(currentLocale());
	const bangla = $derived(toBanglaDate(now));
	const days = $derived(tHome.raw<string[]>('days'));
	const months = $derived(tHome.raw<string[]>('months'));
	const season = $derived(tHome.raw<string[]>('seasons')[bangla.monthIdx] ?? '');
</script>

<div class="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground mb-4">
	<div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
	<div class="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>
	<div class="relative px-6 py-4 flex items-start justify-between gap-4">
		<div>
			<p class="text-xl font-bold tracking-wide mb-1">
				{formatNum(hijri.day, locale)}
				{locale === 'bn' ? hijri.monthBn : hijri.monthEn}, {formatNum(hijri.year, locale)}
				{t('hijri')}
			</p>
			<p class="text-base text-white/85 font-semibold">{days[now.getDay()]}, {formatNum(now.getDate(), locale)} {months[now.getMonth()]} {formatNum(now.getFullYear(), locale)}</p>
			<p class="text-base text-white/70">{formatNum(bangla.day, locale)} {locale === 'bn' ? bangla.monthBn : bangla.monthEn}, {formatNum(bangla.year, locale)} — {season}</p>
		</div>
		<div class="flex items-center gap-1.5 shrink-0 mt-1">
			{#if locating}<Loader2 class="w-3.5 h-3.5 animate-spin opacity-70" />{:else}<MapPin class="w-3.5 h-3.5 opacity-70" />{/if}
			<span class="text-base opacity-80">{location}</span>
		</div>
	</div>
</div>
