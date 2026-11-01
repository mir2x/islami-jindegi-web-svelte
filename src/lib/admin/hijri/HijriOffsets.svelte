<script lang="ts">
	import { onMount } from 'svelte';
	import type { HijriCountryOffset } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import { inp } from '../ui/classes.ts';

	const MIN = -3;
	const MAX = 3;

	let rows = $state<HijriCountryOffset[]>([]);
	let loading = $state(true);
	let newCode = $state('');
	let newDays = $state('1');
	let busy = $state(false);
	let removing = $state<HijriCountryOffset | null>(null);
	// Edited-but-unsaved values, by country code.
	let draft = $state<Record<string, string>>({});

	async function load() {
		try {
			const res = await api.get<{ data: HijriCountryOffset[] }>('/api/hijri/offsets');
			rows = res.data;
			draft = {};
		} catch {
			toast.error('Could not load country offsets');
		} finally {
			loading = false;
		}
	}
	onMount(load);

	/** Parses the offset field; null when it is not a whole number in range. */
	function parseDays(value: string): number | null {
		const n = Number(value);
		return value.trim() !== '' && Number.isInteger(n) && n >= MIN && n <= MAX ? n : null;
	}

	async function save(code: string, value: string) {
		const days = parseDays(value);
		if (days === null) return toast.error(`Offset must be a whole number from ${MIN} to ${MAX}`);
		busy = true;
		try {
			await api.put(`/api/hijri/offsets/${code}`, { offsetDays: days });
			toast.success(`${code} offset saved`);
			await load();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Could not save the offset');
		} finally {
			busy = false;
		}
	}

	async function add(e: SubmitEvent) {
		e.preventDefault();
		const code = newCode.trim().toUpperCase();
		if (!/^[A-Z]{2}$/.test(code)) return toast.error('Country code must be two letters, e.g. TR');
		if (rows.some((r) => r.countryCode === code)) return toast.error(`${code} already has an offset: edit it in the list`);
		await save(code, newDays);
		newCode = '';
	}

	async function remove() {
		if (!removing) return;
		busy = true;
		try {
			await api.delete(`/api/hijri/offsets/${removing.countryCode}`);
			toast.success(`${removing.countryCode} offset removed`);
			removing = null;
			await load();
		} catch {
			toast.error('Could not remove the offset');
		} finally {
			busy = false;
		}
	}
</script>

<Card title="Country Offsets">
	<p class="text-sm text-muted-foreground">
		Days a country's Hijri months start after the Saudi (Umm al-Qura) calendar when no sighting is recorded for that month. A country with no row follows Saudi exactly. The app keeps a copy and refreshes it daily.
	</p>

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading…</p>
	{:else}
		<ul class="divide-y divide-border rounded-lg border">
			{#each rows as row (row.countryCode)}
				{@const value = draft[row.countryCode] ?? String(row.offsetDays)}
				<li class="flex items-center gap-3 px-3 py-2">
					<span class="w-12 rounded bg-muted px-2 py-0.5 text-center font-mono text-sm font-bold">{row.countryCode}</span>
					<input
						type="number"
						min={MIN}
						max={MAX}
						step="1"
						aria-label={`${row.countryCode} offset in days`}
						{value}
						oninput={(e) => (draft[row.countryCode] = e.currentTarget.value)}
						class={inp('w-20')}
					/>
					<span class="text-xs text-muted-foreground">days</span>
					<div class="ml-auto flex gap-2">
						<Button size="sm" variant="outline" disabled={busy || value === String(row.offsetDays)} onclick={() => save(row.countryCode, value)}>Save</Button>
						<Button size="sm" variant="ghost" disabled={busy} onclick={() => (removing = row)}>Remove</Button>
					</div>
				</li>
			{:else}
				<li class="px-3 py-4 text-sm text-muted-foreground">No offsets: every country follows the Saudi calendar.</li>
			{/each}
		</ul>

		<form onsubmit={add} class="flex flex-wrap items-center gap-3">
			<input
				value={newCode}
				oninput={(e) => (newCode = e.currentTarget.value.toUpperCase().slice(0, 2))}
				placeholder="Code (e.g. TR)"
				aria-label="Country code"
				class={inp('w-36')}
			/>
			<input type="number" min={MIN} max={MAX} step="1" bind:value={newDays} aria-label="Offset in days" class={inp('w-20')} />
			<span class="text-xs text-muted-foreground">days</span>
			<Button type="submit" disabled={busy}>Add country</Button>
		</form>
	{/if}
</Card>

<ConfirmDialog open={removing !== null} title="Remove offset" busy={busy} confirmLabel="Remove" busyLabel="Removing..." onconfirm={remove} oncancel={() => (removing = null)}>
	{#if removing}
		{removing.countryCode} will follow the Saudi calendar for months with no recorded sighting.
	{/if}
</ConfirmDialog>
