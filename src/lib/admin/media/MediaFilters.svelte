<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';
	import { lookups } from '../lookups.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Combobox, { type ComboOption } from '../ui/Combobox.svelte';
	import { inp } from '../ui/classes.ts';
	import Select from '../ui/Select.svelte';
	import type { MediaBrowser } from './browser.svelte.ts';

	let { browser }: { browser: MediaBrowser } = $props();

	// Keys the API accepts; the first entry means "any module".
	const MODULES = [
		{ value: '', label: 'All modules' },
		{ value: 'bayan', label: 'Bayan' },
		{ value: 'masail', label: 'Masail' },
		{ value: 'malfuzat', label: 'Malfuzat' },
		{ value: 'dua', label: 'Dua' },
		{ value: 'article', label: 'Article' },
		{ value: 'book', label: 'Book' },
		{ value: 'page', label: 'Page' },
		{ value: 'madrasah', label: 'Madrasah' }
	];

	const MONTHS = [
		{ value: '', label: 'Month' },
		...['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((label, i) => ({
			value: String(i + 1),
			label
		}))
	];
	const FIRST_YEAR = 2000;
	const thisYear = new Date().getFullYear();
	const yearOptions = [{ value: '', label: 'Year' }, ...Array.from({ length: thisYear - FIRST_YEAR + 1 }, (_, i) => String(thisYear - i))];

	let fromYear = $state('');
	let fromMonth = $state('');
	let toYear = $state('');
	let toMonth = $state('');

	const pad = (n: number) => String(n).padStart(2, '0');
	// First and last day of a year, or of one month when the month is chosen.
	const firstDay = (y: string, m: string) => (y ? `${y}-${pad(m ? +m : 1)}-01` : '');
	const lastDay = (y: string, m: string) => (y ? `${y}-${pad(m ? +m : 12)}-${pad(new Date(+y, m ? +m : 12, 0).getDate())}` : '');

	// Only a "from" period means just that month (or year); a "to" period extends the range to its end.
	function apply() {
		const dateFrom = firstDay(fromYear, fromMonth);
		const dateTo = toYear ? lastDay(toYear, toMonth) : lastDay(fromYear, fromMonth);
		browser.setFilter({ dateFrom, dateTo });
	}

	// "Clear filters" empties the dates; the selects follow.
	$effect(() => {
		if (!browser.dateFrom && !browser.dateTo) fromYear = fromMonth = toYear = toMonth = '';
	});

	onMount(() => void lookups.ensureAll());

	const authors = $derived<ComboOption[]>(lookups.authors.map((a) => ({ id: a.id, label: a.name })));
	const categories = $derived<ComboOption[]>(
		lookups.categories.flatMap((c) => [{ id: c.id, label: c.title }, ...(c.children ?? []).map((k) => ({ id: k.id, label: k.title, child: true }))])
	);
	// Pages and madrasahs have no author or category, so those filters can never match them.
	const noTaxonomy = $derived(browser.module === 'page' || browser.module === 'madrasah');
</script>

<div class="flex flex-wrap items-center gap-3 w-full">
	<Select value={browser.module} options={MODULES} filter class="w-36" onchange={(v) => browser.setFilter({ module: v })} />
	<Combobox
		options={authors}
		value={browser.authorId}
		placeholder="All authors"
		searchPlaceholder="Search authors..."
		clearable
		filter
		class="w-48"
		onchange={(v) => browser.setFilter({ authorId: v as string })}
	/>
	<Combobox
		options={categories}
		value={browser.categoryId}
		placeholder="All categories"
		searchPlaceholder="Search categories..."
		clearable
		filter
		class="w-48"
		onchange={(v) => browser.setFilter({ categoryId: v as string })}
	/>
	<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
		From
		<Select value={fromYear} options={yearOptions} filter class="w-24" onchange={(v) => ((fromYear = v), apply())} />
		<Select value={fromMonth} options={MONTHS} filter class="w-32" onchange={(v) => ((fromMonth = v), apply())} />
	</div>
	<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
		To
		<Select value={toYear} options={yearOptions} filter class="w-24" onchange={(v) => ((toYear = v), apply())} />
		<Select value={toMonth} options={MONTHS} filter class="w-32" onchange={(v) => ((toMonth = v), apply())} />
	</div>
	<label class="flex items-center gap-1.5 text-sm">
		<input type="checkbox" checked={browser.unused} onchange={(e) => browser.setFilter({ unused: e.currentTarget.checked })} /> Unused only
	</label>
	{#if browser.filtered}
		<Button variant="ghost" size="sm" class="gap-1" onclick={() => browser.clearFilters()}><X class="w-3.5 h-3.5" /> Clear filters</Button>
	{/if}
</div>
{#if noTaxonomy && (browser.authorId || browser.categoryId)}
	<p class="text-xs text-muted-foreground">Pages and madrasahs have no author or category, so no files match.</p>
{/if}
