<script lang="ts">
	import Filter from '@lucide/svelte/icons/filter';
	import type { HijriMonthSighting } from '#lib/types.ts';
	import SimpleList from '../list/SimpleList.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import Select from '../ui/Select.svelte';
	import { FILTER_COUNTRIES, monthName } from './months.ts';

	let country = $state('');
	let year = $state('');
	let page = $state(1);
</script>

<SimpleList
	bind:page
	title="Hijri Sightings"
	unit="sighting overrides"
	singular="sighting"
	plural="sightings"
	apiPath="/api/hijri/sightings"
	slug="hijri"
	addLabel="Add Sighting"
	icon="moon"
	emptyHint="Add your first sighting override"
	filteredHint="Try different filters"
	minWidth="min-w-[560px]"
	clickable={false}
	params={{ countryCode: country, hijriYear: year }}
	deleteSuccess="Sighting deleted"
	deleteNote="will be permanently deleted. The system will fall back to the default country offset."
	nameOf={(s: HijriMonthSighting) => `${s.countryCode} — ${s.hijriYear}/${s.hijriMonth} ${monthName(s.hijriMonth)}`}
	columns={[
		{ label: 'Country', cell: countryCell, skeleton: 'h-4 w-10' },
		{ label: 'Hijri Month', cell: monthCell, skeleton: 'h-4 w-40' },
		{ label: 'Gregorian Start', cell: startCell, skeleton: 'h-4 w-28' },
		{ label: 'Updated', cell: updatedCell, skeleton: 'h-4 w-24' }
	]}
>
	{#snippet filters()}
		<div class="flex items-center gap-3">
			<Filter class="w-4 h-4 text-muted-foreground shrink-0" />
			<Select class="w-36" filter bind:value={country} onchange={() => (page = 1)} options={[{ value: '', label: 'All countries' }, ...FILTER_COUNTRIES]} />
			<input type="number" placeholder="Hijri year (e.g. 1447)" bind:value={year} oninput={() => (page = 1)} class={inp('w-52 bg-card')} />
			{#if country || year}
				<button
					type="button"
					onclick={() => {
						country = '';
						year = '';
						page = 1;
					}}
					class="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button
				>
			{/if}
		</div>
	{/snippet}
</SimpleList>

{#snippet countryCell(s: HijriMonthSighting)}<span class="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">{s.countryCode}</span>{/snippet}
{#snippet monthCell(s: HijriMonthSighting)}
	<p class="font-semibold">{s.hijriYear} — {s.hijriMonth}. {monthName(s.hijriMonth)}</p>
	<p class="text-xs text-muted-foreground mt-0.5">{s.monthNameBn}</p>
{/snippet}
{#snippet startCell(s: HijriMonthSighting)}<span class="text-sm font-mono">{s.gregorianStartDate}</span>{/snippet}
{#snippet updatedCell(s: HijriMonthSighting)}<span class="text-sm text-muted-foreground">{new Date(s.updatedAt).toLocaleDateString()}</span>{/snippet}
