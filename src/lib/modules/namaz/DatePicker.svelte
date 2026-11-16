<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import { HIJRI_MONTHS_EN, formatNum, toHijri } from '#lib/calendar.ts';
	import { getHijriMonth, type HijriMonth } from '#lib/hijri.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { getSettings } from '#lib/settings.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		/** The day being shown now. */
		value: Date;
		/** ISO country whose moon sighting decides the Hijri month starts. */
		country: string;
		onpick: (date: Date) => void;
	}
	let { value, country, onpick }: Props = $props();

	const t = useT('NamazTimesPage');
	const tHome = useT('Home');
	const locale = $derived(currentLocale());
	const months = $derived(tHome.raw<string[]>('months'));
	const weekdays = $derived.by(() => {
		const f = new Intl.DateTimeFormat(locale, { weekday: 'short' });
		return Array.from({ length: 7 }, (_, i) => f.format(new Date(2023, 0, 1 + i)));
	});

	// The calendars page independently of the chosen day: only a tap on a day changes it.
	/* svelte-ignore state_referenced_locally */
	const seed = toHijri(value);
	let mode = $state<'hijri' | 'gregorian'>('hijri');
	/* svelte-ignore state_referenced_locally */
	let gy = $state(value.getFullYear());
	/* svelte-ignore state_referenced_locally */
	let gm = $state(value.getMonth());
	let hy = $state(seed.year);
	let hm = $state(seed.month);
	let hijriData = $state<HijriMonth | null>(null);
	let failed = $state(false);

	// The Hijri range the app offers, and the Gregorian one.
	const H_MIN = 1400;
	const H_MAX = 1500;
	const G_MIN = 633;
	const G_MAX = 2100;

	$effect(() => {
		const [y, m] = [hy, hm];
		let stale = false;
		hijriData = null;
		failed = false;
		getHijriMonth(y, m, country).then((d) => {
			if (stale) return;
			hijriData = d;
			failed = !d;
		});
		return () => (stale = true);
	});

	const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
	const today = new Date();

	/** Cells of the visible month: leading blanks to the weekday, then each day as a civil date. */
	const cells = $derived.by((): (Date | null)[] => {
		let first: Date;
		let length: number;
		if (mode === 'gregorian') {
			first = new Date(gy, gm, 1);
			length = new Date(gy, gm + 1, 0).getDate();
		} else {
			if (!hijriData) return [];
			const [y, mo, d] = hijriData.gregorianStartDate.split('-').map(Number);
			// The visitor's own whole-day adjustment moves the Hijri date, so it moves the grid the other way.
			first = new Date(y, mo - 1, d - getSettings().hijriAdjustment);
			length = hijriData.monthLength;
		}
		const out: (Date | null)[] = Array(first.getDay()).fill(null);
		for (let i = 0; i < length; i++) out.push(new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));
		return out;
	});

	const lead = $derived(cells.findIndex(Boolean));

	const title = $derived(
		mode === 'gregorian' ? `${months[gm]} ${formatNum(gy, locale)}` : `${locale === 'bn' ? (hijriData?.monthNameBn ?? '') : HIJRI_MONTHS_EN[hm - 1]} ${formatNum(hy, locale)}`
	);

	function step(months_: number) {
		if (mode === 'gregorian') {
			const d = new Date(gy, gm + months_, 1);
			if (d.getFullYear() < G_MIN || d.getFullYear() > G_MAX) return;
			[gy, gm] = [d.getFullYear(), d.getMonth()];
		} else {
			const n = hy * 12 + (hm - 1) + months_;
			const y = Math.floor(n / 12);
			if (y < H_MIN || y > H_MAX) return;
			[hy, hm] = [y, (n % 12) + 1];
		}
	}

	function goToday() {
		const h = toHijri(today);
		[gy, gm, hy, hm] = [today.getFullYear(), today.getMonth(), h.year, h.month];
		onpick(today);
	}

	const tab = (active: boolean) =>
		cn('flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted');
	const nav = 'w-8 h-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors';
</script>

<div class="w-[19rem] max-w-[calc(100vw-2rem)] p-3 bg-card text-card-foreground border border-border rounded-2xl shadow-xl">
	<div class="flex gap-1 p-1 mb-3 bg-muted/60 rounded-xl" role="tablist">
		<button type="button" role="tab" aria-selected={mode === 'hijri'} class={tab(mode === 'hijri')} onclick={() => (mode = 'hijri')}>{t('hijri')}</button>
		<button type="button" role="tab" aria-selected={mode === 'gregorian'} class={tab(mode === 'gregorian')} onclick={() => (mode = 'gregorian')}>{t('gregorian')}</button>
	</div>

	<div class="flex items-center justify-between mb-2">
		<div class="flex">
			<button type="button" class={nav} aria-label={t('prevYear')} onclick={() => step(-12)}><ChevronsLeft class="w-4 h-4" /></button>
			<button type="button" class={nav} aria-label={t('prevMonth')} onclick={() => step(-1)}><ChevronLeft class="w-4 h-4" /></button>
		</div>
		<p class="text-sm font-bold text-foreground">{title}</p>
		<div class="flex">
			<button type="button" class={nav} aria-label={t('nextMonth')} onclick={() => step(1)}><ChevronRight class="w-4 h-4" /></button>
			<button type="button" class={nav} aria-label={t('nextYear')} onclick={() => step(12)}><ChevronsRight class="w-4 h-4" /></button>
		</div>
	</div>

	<div class="grid grid-cols-7 text-center text-xs text-muted-foreground mb-1">
		{#each weekdays as w, i (i)}<span>{w}</span>{/each}
	</div>

	{#if mode === 'hijri' && !hijriData}
		<div class="h-48 flex items-center justify-center text-sm text-muted-foreground">
			{#if failed}{t('monthUnavailable')}{:else}<Loader2 class="w-5 h-5 animate-spin text-primary" />{/if}
		</div>
	{:else}
		<div class="grid grid-cols-7 gap-y-1 text-center">
			{#each cells as day, i (i)}
				{#if day}
					{@const chosen = sameDay(day, value)}
					<button
						type="button"
						aria-pressed={chosen}
						onclick={() => onpick(day)}
						class={cn(
							'h-9 rounded-lg text-sm tabular-nums transition-colors',
							chosen ? 'bg-primary text-primary-foreground font-bold' : sameDay(day, today) ? 'ring-1 ring-primary text-primary font-semibold' : 'text-foreground hover:bg-muted'
						)}
					>
						<span class="block leading-none">{formatNum(mode === 'hijri' ? i - lead + 1 : day.getDate(), locale)}</span>
						{#if mode === 'hijri'}<span class="block text-[10px] leading-none mt-0.5 opacity-60">{formatNum(day.getDate(), locale)}</span>{/if}
					</button>
				{:else}
					<span></span>
				{/if}
			{/each}
		</div>
	{/if}

	<button type="button" class="mt-3 w-full py-2 text-sm font-semibold rounded-lg text-primary hover:bg-primary/10 transition-colors" onclick={goToday}>{t('today')}</button>
</div>
