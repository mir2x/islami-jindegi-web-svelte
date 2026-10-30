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

	onMount(() => void lookups.ensureAll());

	const authors = $derived<ComboOption[]>(lookups.authors.map((a) => ({ id: a.id, label: a.name })));
	const categories = $derived<ComboOption[]>(lookups.categories.flatMap((c) => [{ id: c.id, label: c.title }, ...(c.children ?? []).map((k) => ({ id: k.id, label: k.title, child: true }))]));
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
	<label class="flex items-center gap-1.5 text-xs text-muted-foreground">
		From <input type="date" value={browser.dateFrom} max={browser.dateTo || undefined} onchange={(e) => browser.setFilter({ dateFrom: e.currentTarget.value })} class={inp('w-36 bg-card')} />
	</label>
	<label class="flex items-center gap-1.5 text-xs text-muted-foreground">
		To <input type="date" value={browser.dateTo} min={browser.dateFrom || undefined} onchange={(e) => browser.setFilter({ dateTo: e.currentTarget.value })} class={inp('w-36 bg-card')} />
	</label>
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
