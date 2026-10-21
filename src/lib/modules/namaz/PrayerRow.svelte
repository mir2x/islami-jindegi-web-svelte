<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Clock from '@lucide/svelte/icons/clock';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import Sunrise from '@lucide/svelte/icons/sunrise';
	import Sunset from '@lucide/svelte/icons/sunset';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { Component } from 'svelte';
	import { countdownParts, formatNum, formatTime } from '#lib/calendar.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { PrayerSlot } from '#lib/prayer-times.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		slot: PrayerSlot;
		active: boolean;
		selected: boolean;
		linkable: boolean;
		now: Date;
	}
	let { slot, active, selected, linkable, now }: Props = $props();

	const t = useT('NamazTimesPage');
	const locale = $derived(currentLocale());
	const single = $derived(slot.start.getTime() === slot.end.getTime());
	const left = $derived(active ? countdownParts(slot.end, now) : null);

	const ICONS: Record<string, Component<{ class?: string }>> = {
		tahajjud: Moon,
		isha: Moon,
		fajr: Sunrise,
		sunrise: Sunrise,
		ishraq: Sun,
		midday: Sun,
		dhuhr: Sun,
		asr: Sun,
		sunset: Sunset,
		maghrib: Sunset
	};
	const Icon = $derived(ICONS[slot.key] ?? Clock);
</script>

<div
	class={cn(
		'group flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all',
		active
			? 'bg-primary border-primary shadow-lg shadow-primary/20 dark:bg-primary/15 dark:border-primary/70 dark:shadow-none'
			: slot.isForbidden
				? 'bg-card border-border/60 opacity-75'
				: 'bg-card border-border hover:border-primary/40 hover:bg-primary/3',
		// The row whose details are open: an inset ring (an outer one would be clipped by the scrolling list).
		selected && 'border-primary ring-2 ring-inset ring-primary opacity-100'
	)}
>
	<div class={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', active ? 'bg-white/15 dark:bg-primary/20' : slot.isForbidden ? 'bg-red-50 dark:bg-red-950/30' : 'bg-primary/10')}>
		<Icon class={cn('w-5 h-5', active ? 'text-white dark:text-primary' : slot.isForbidden ? 'text-red-400' : 'text-primary')} />
	</div>

	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2">
			<span class={cn('font-semibold text-[17px] leading-snug', active ? 'text-white dark:text-foreground' : 'text-foreground')}>{locale === 'bn' ? slot.nameBn : slot.nameEn}</span>
			{#if slot.isForbidden && !active}<TriangleAlert class="w-3.5 h-3.5 text-red-400 shrink-0" />{/if}
		</div>
		{#if left}
			<p class="text-sm text-white/70 dark:text-primary mt-0.5">
				{left.hours > 0
					? t('countdownHM', { hours: formatNum(left.hours, locale), minutes: formatNum(left.minutes, locale) })
					: t('countdownM', { minutes: formatNum(left.minutes, locale) })}
			</p>
		{/if}
	</div>

	<div class="text-right shrink-0">
		<p class={cn('font-bold tabular-nums text-[17px]', active ? 'text-white dark:text-foreground' : 'text-foreground')}>{formatTime(slot.start, locale)}</p>
		{#if !single}<p class={cn('text-sm tabular-nums', active ? 'text-white/65 dark:text-foreground/65' : 'text-muted-foreground')}>{t('endsAt')} {formatTime(slot.end, locale)}</p>{/if}
	</div>

	{#if linkable}<ChevronRight class={cn('w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5', active ? 'text-white/70 dark:text-foreground/70' : 'text-muted-foreground')} />{/if}
</div>
