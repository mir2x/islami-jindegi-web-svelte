<script lang="ts">
	import { untrack } from 'svelte';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import X from '@lucide/svelte/icons/x';
	import Popover from '#lib/components/ui/Popover.svelte';
	import type { DateRange } from '#lib/filters.ts';
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import DateTextInput from './DateTextInput.svelte';

	type Preset = 'all' | 'today' | 'yesterday' | 'last7days' | 'lastMonth' | 'lastYear' | 'custom';

	let { value, onchange }: { value: DateRange; onchange: (range: DateRange) => void } = $props();

	const isBn = $derived(currentLocale() === 'bn');
	let open = $state(false);
	let preset = $state<Preset>(untrack(() => (value.from || value.to ? 'custom' : 'all')));

	// Falls back to "any date" when the range is cleared from outside.
	$effect(() => {
		if (!value.from && !value.to && preset !== 'custom') preset = 'all';
	});

	const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

	function rangeFor(p: Preset): DateRange {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const back = (apply: (d: Date) => void) => {
			const from = new Date(today);
			apply(from);
			return { from: iso(from), to: iso(today) };
		};
		switch (p) {
			case 'today':
				return { from: iso(today), to: iso(today) };
			case 'yesterday': {
				const y = new Date(today);
				y.setDate(y.getDate() - 1);
				return { from: iso(y), to: iso(y) };
			}
			case 'last7days':
				return back((d) => d.setDate(d.getDate() - 6));
			case 'lastMonth':
				return back((d) => d.setMonth(d.getMonth() - 1));
			case 'lastYear':
				return back((d) => d.setFullYear(d.getFullYear() - 1));
			default:
				return { from: '', to: '' };
		}
	}

	const labels = $derived<Record<Preset, string>>(
		isBn
			? { all: 'সব সময়', today: 'আজ', yesterday: 'গতকাল', last7days: 'গত ৭ দিন', lastMonth: 'গত মাস', lastYear: 'গত বছর', custom: 'কাস্টম তারিখ' }
			: { all: 'Any date', today: 'Today', yesterday: 'Yesterday', last7days: 'Last 7 days', lastMonth: 'Last month', lastYear: 'Last year', custom: 'Custom date' }
	);
	const presets: Preset[] = ['today', 'yesterday', 'last7days', 'lastMonth', 'lastYear', 'custom'];
	const activeLabel = $derived(preset === 'all' ? (isBn ? 'তারিখ' : 'Date') : labels[preset]);

	function select(next: Preset) {
		preset = next;
		onchange(next === 'custom' ? value : rangeFor(next));
		if (next !== 'custom') open = false;
	}
	function clear() {
		preset = 'all';
		onchange({ from: '', to: '' });
		open = false;
	}
</script>

<Popover
	bind:open
	align="end"
	label={isBn ? 'তারিখ দিয়ে ফিল্টার করুন' : 'Filter by date'}
	triggerClass="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
	class="w-72 p-3"
>
	{#snippet trigger()}
		<CalendarDays class="h-4 w-4 text-muted-foreground" />
		<span class="max-w-28 truncate">{activeLabel}</span>
		<ChevronDown class="h-3.5 w-3.5 text-muted-foreground" />
	{/snippet}

	<p class="px-1 pb-2 text-sm font-medium">{isBn ? 'তারিখ অনুযায়ী দেখুন' : 'Filter by date'}</p>
	<div class="grid grid-cols-2 gap-1">
		{#each presets as key (key)}
			<button
				type="button"
				onclick={() => select(key)}
				class={cn('rounded-lg px-2.5 py-2 text-left text-sm transition-colors', preset === key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
			>
				{labels[key]}
			</button>
		{/each}
	</div>
	{#if preset === 'custom'}
		<div class="mt-3 space-y-2 border-t border-border pt-3">
			<DateTextInput label={isBn ? 'শুরুর তারিখ' : 'Start date'} value={value.from} onchange={(from) => onchange({ ...value, from })} />
			<DateTextInput label={isBn ? 'শেষ তারিখ' : 'End date'} value={value.to} onchange={(to) => onchange({ ...value, to })} />
		</div>
	{/if}
	{#if value.from || value.to}
		<button type="button" onclick={clear} class="mt-3 inline-flex items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-foreground">
			<X class="h-3.5 w-3.5" />{isBn ? 'তারিখের ফিল্টার মুছুন' : 'Clear date filter'}
		</button>
	{/if}
</Popover>
