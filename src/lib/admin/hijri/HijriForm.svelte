<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { NEXT_PUBLIC_API_URL } from '$app/env/public';
	import { onMount } from 'svelte';
	import type { HijriMonthSighting } from '#lib/types.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import Select from '../ui/Select.svelte';
	import { saveForm } from '../ui/save.ts';
	import { FORM_COUNTRIES, HIJRI_MONTHS } from './months.ts';

	let { item = null }: { item?: HijriMonthSighting | null } = $props();

	// svelte-ignore state_referenced_locally
	let countryCode = $state(item?.countryCode ?? 'BD');
	// svelte-ignore state_referenced_locally
	let hijriYear = $state(String(item?.hijriYear ?? ''));
	// svelte-ignore state_referenced_locally
	let hijriMonth = $state(String(item?.hijriMonth ?? ''));
	// svelte-ignore state_referenced_locally
	let start = $state(item?.gregorianStartDate ?? '');
	let saving = $state(false);

	// A new sighting starts from the live Hijri date.
	onMount(async () => {
		if (item) return;
		try {
			const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/hijri/date?country-code=BD`);
			const { data } = (await res.json()) as { data: { hijriYear: number; hijriMonth: number } };
			hijriYear = String(data.hijriYear);
			hijriMonth = String(data.hijriMonth);
		} catch {
			hijriYear = '1447';
			hijriMonth = '1';
		}
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		const year = parseInt(hijriYear, 10);
		const month = parseInt(hijriMonth, 10);
		if (!countryCode.trim()) return toast.error('Country code is required');
		if (isNaN(year) || year < 1300 || year > 1600) return toast.error('Hijri year must be between 1300 and 1600');
		if (isNaN(month) || month < 1 || month > 12) return toast.error('Hijri month must be 1–12');
		if (!start) return toast.error('Gregorian start date is required');
		saving = true;
		const ok = await saveForm({
			apiPath: '/api/hijri/sightings',
			id: item?.id,
			name: 'Sighting',
			redirect: '/admin/hijri',
			payload: { countryCode: countryCode.toUpperCase().trim(), hijriYear: year, hijriMonth: month, gregorianStartDate: start },
			conflictMessage: 'A sighting for this country/year/month already exists'
		});
		if (ok) {
			try {
				localStorage.removeItem('ij_hijri_cache');
			} catch {
				/* ignore */
			}
		}
		saving = false;
	}
</script>

<div class="max-w-3xl mx-auto p-4 sm:p-5">
	<button type="button" onclick={() => goBack('/admin/hijri')} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
		><ArrowLeft class="w-4 h-4" /> Back</button
	>
	<div class="mb-4">
		<h1 class="text-2xl font-bold tracking-tight">{item ? 'Edit Hijri Sighting' : 'Add Hijri Sighting'}</h1>
		<p class="mt-1 text-sm text-muted-foreground">Override the Gregorian start date for a Hijri month in a specific country.</p>
	</div>

	<form onsubmit={submit} class="space-y-4">
		<Card title="Sighting Details">
			<Field label="Country Code" class="space-y-2">
				<div class="flex gap-2">
					<Select class="w-40" bind:value={countryCode} options={FORM_COUNTRIES} />
					<input value={countryCode} oninput={(e) => (countryCode = e.currentTarget.value.toUpperCase().slice(0, 10))} placeholder="Custom (e.g. TR)" class={inp('flex-1')} />
				</div>
				<p class="text-xs text-muted-foreground">ISO 3166-1 alpha-2 country code. BD, SA, PK, IN, AU use a default +1 day offset if no override exists.</p>
			</Field>
			<Field label="Hijri Year" class="space-y-2"><input type="number" bind:value={hijriYear} placeholder="e.g. 1447" min="1300" max="1600" class={inputCls} /></Field>
			<Field label="Hijri Month" class="space-y-2">
				<Select
					bind:value={hijriMonth}
					options={[{ value: '', label: 'Select month' }, ...HIJRI_MONTHS.map((m) => ({ value: String(m.value), label: `${m.value}. ${m.en} — ${m.bn}` }))]}
				/>
			</Field>
			<Field label="Gregorian Start Date" class="space-y-2">
				<input type="date" bind:value={start} class={inputCls} />
				<p class="text-xs text-muted-foreground">The Gregorian date on which this Hijri month begins in this country (moon sighting date).</p>
			</Field>
		</Card>
		<div class="flex gap-3">
			<Button type="submit" disabled={saving}>{saving ? 'Saving...' : item ? 'Update Sighting' : 'Create Sighting'}</Button>
			<Button variant="outline" onclick={() => goBack('/admin/hijri')}>Cancel</Button>
		</div>
	</form>
</div>
