<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import MiniCalendar from '#lib/components/ui/MiniCalendar.svelte';
	import Popover from '#lib/components/ui/Popover.svelte';
	import { cn } from '#lib/utils.ts';

	let { value, label, onchange }: { value: string; label: string; onchange: (iso: string) => void } = $props();

	// `YYYY-MM-DD` <-> `DD/MM/YYYY`.
	const toDisplay = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '');
	function toIso(text: string) {
		const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (!m) return null;
		const [, d, mo, y] = m;
		const probe = new Date(Date.UTC(+y, +mo - 1, +d));
		return probe.getUTCFullYear() === +y && probe.getUTCMonth() === +mo - 1 && probe.getUTCDate() === +d ? `${y}-${mo}-${d}` : null;
	}
	const MONTHS = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2020, i, 1)));

	let text = $state('');
	let pickerOpen = $state(false);
	let monthPicker = $state(false);
	let shown = $state(new Date());

	// Re-sync the text box and calendar when the value changes from outside.
	$effect(() => {
		text = toDisplay(value);
		if (value) shown = new Date(`${value}T00:00:00`);
	});

	function commit() {
		if (!text.trim()) return onchange('');
		const iso = toIso(text);
		if (iso) onchange(iso);
		else text = toDisplay(value);
	}
	function pick(iso: string) {
		onchange(iso);
		pickerOpen = false;
	}
	const setYear = (year: string) => {
		const y = Number(year);
		if (Number.isInteger(y) && y >= 1900 && y <= 2100) shown = new Date(y, shown.getMonth(), 1);
	};
	const fieldClass = 'h-8 rounded-md border border-border bg-background px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring';
</script>

<div class="relative">
	<input
		aria-label={label}
		type="text"
		inputmode="numeric"
		placeholder="DD/MM/YYYY"
		bind:value={text}
		onblur={commit}
		onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
		class="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
	/>
	<Popover
		bind:open={pickerOpen}
		label={`${label} calendar`}
		rootClass="absolute left-2.5 top-1/2 -translate-y-1/2"
		triggerClass="rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
		class="w-[18rem] p-0"
	>
		{#snippet trigger()}<CalendarDays class="h-4 w-4" />{/snippet}

		<div class="flex items-center justify-center gap-2 border-b border-border p-3">
			<button type="button" onclick={() => (monthPicker = !monthPicker)} class={cn(fieldClass, 'w-28 hover:bg-muted')}>
				{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(shown)}
			</button>
			<input
				aria-label="Year"
				type="number"
				min="1900"
				max="2100"
				value={shown.getFullYear()}
				oninput={(e) => setYear(e.currentTarget.value)}
				class={cn(fieldClass, 'w-20 text-center')}
			/>
		</div>
		{#if monthPicker}
			<div class="grid grid-cols-3 gap-1 p-3">
				{#each MONTHS as month, i (month)}
					<button
						type="button"
						onclick={() => {
							shown = new Date(shown.getFullYear(), i, 1);
							monthPicker = false;
						}}
						class={cn('rounded-md px-2 py-2 text-sm', shown.getMonth() === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{month}</button
					>
				{/each}
			</div>
		{:else}
			<MiniCalendar month={shown} selected={value} onselect={pick} />
		{/if}
	</Popover>
</div>
