<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { onMount, untrack } from 'svelte';
	import type { PagedResult } from '#lib/types.ts';
	import { ApiError, api, qs } from '../api.ts';
	import X from '@lucide/svelte/icons/x';
	import { lookups } from '../lookups.svelte.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import Combobox, { type ComboOption } from '../ui/Combobox.svelte';
	import Select from '../ui/Select.svelte';
	import Tabs from '../ui/Tabs.svelte';
	import { inp } from '../ui/classes.ts';
	import { POPUP_MODULES, type PopupModule, type ScheduleRow, addDays, dateKey, isShowable, monthGrid, monthLabel, moduleMeta, parseKey } from './popup-calendar.ts';

	interface Candidate {
		id: string;
		title: string;
		/** `yyyy-MM-dd`, when the item has a publication date. */
		date: string;
	}

	const PAGE_SIZE = 15;
	const MONTHS = [
		{ value: '', label: 'Month' },
		...['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((label, i) => ({
			value: String(i + 1),
			label
		}))
	];
	const FIRST_YEAR = 2000;
	const thisYear = new Date().getFullYear();
	const YEARS = [{ value: '', label: 'Year' }, ...Array.from({ length: thisYear - FIRST_YEAR + 1 }, (_, i) => String(thisYear - i))];

	const todayKey = dateKey(new Date());
	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	let cursor = $state({ year: new Date().getFullYear(), month: new Date().getMonth() });
	let rows = $state<Record<string, ScheduleRow>>({});
	let selected = $state(todayKey);
	let loading = $state(true);
	let busy = $state(false);

	// The editor: which kind, the search box, and the item picked but not yet saved.
	let tab = $state<PopupModule>('malfuzat');
	let query = $state('');
	let candidates = $state<Candidate[]>([]);
	let searching = $state(false);
	let loadingMore = $state(false);
	let total = $state(0);
	let picked = $state<{ id: string; title: string } | null>(null);

	// Narrow the list: by category and by publication date (a year and optional month at each end).
	let categoryId = $state('');
	let fromYear = $state('');
	let fromMonth = $state('');
	let toYear = $state('');
	let toMonth = $state('');

	const pad = (n: number) => String(n).padStart(2, '0');
	const firstDay = (y: string, m: string) => (y ? `${y}-${pad(m ? +m : 1)}-01` : '');
	const lastDay = (y: string, m: string) => (y ? `${y}-${pad(m ? +m : 12)}-${pad(new Date(+y, m ? +m : 12, 0).getDate())}` : '');
	// Only a "from" period means just that month (or year); a "to" period extends the range to its end.
	const dateFrom = $derived(firstDay(fromYear, fromMonth));
	const dateTo = $derived(toYear ? lastDay(toYear, toMonth) : lastDay(fromYear, fromMonth));
	const filtered = $derived(!!(categoryId || dateFrom || dateTo));

	const categories = $derived<ComboOption[]>(
		lookups.categories.flatMap((c) => [{ id: c.id, label: c.title }, ...(c.children ?? []).map((k) => ({ id: k.id, label: k.title, child: true }))])
	);

	function clearFilters() {
		categoryId = fromYear = fromMonth = toYear = toMonth = '';
	}

	const grid = $derived(monthGrid(cursor.year, cursor.month));
	const current = $derived(rows[selected]);

	let loadSeq = 0;
	async function loadMonth(year: number, month: number) {
		const days = monthGrid(year, month);
		const seq = ++loadSeq;
		loading = true;
		try {
			const res = await api.get<{ data: ScheduleRow[] }>(`/api/popup/schedule?${qs({ from: days[0], to: days[days.length - 1] })}`);
			if (seq !== loadSeq) return;
			// Keep other months' rows already loaded; replace this window's.
			const next = { ...rows };
			for (const d of days) delete next[d];
			for (const r of res.data) next[r.date] = r;
			rows = next;
		} catch {
			if (seq === loadSeq) toast.error('Could not load the schedule');
		} finally {
			if (seq === loadSeq) loading = false;
		}
	}

	$effect(() => {
		void loadMonth(cursor.year, cursor.month);
	});

	// Opening a day, or its saved item changing (first load, save, clear), resets the editor to what
	// is set for it. A reload that brings the same row back leaves a half-made choice alone.
	const savedSignature = $derived(current ? `${current.module}:${current.contentId}` : '');
	$effect(() => {
		void selected;
		void savedSignature;
		untrack(() => {
			const row = rows[selected];
			picked = row ? { id: row.contentId, title: row.title } : null;
			if (row) tab = row.module;
			query = '';
		});
	});

	let searchTimer: ReturnType<typeof setTimeout> | undefined;
	let searchSeq = 0;
	let nextPage = 1;

	async function fetchPage(reset: boolean) {
		const seq = reset ? ++searchSeq : searchSeq;
		if (reset) {
			nextPage = 1;
			searching = true;
		} else {
			loadingMore = true;
		}
		try {
			const params = { search: query.trim(), pageSize: PAGE_SIZE, page: nextPage, published: true, sort: 'position_desc', categoryId, dateFrom, dateTo };
			const res = await api.get<PagedResult<{ id: string; title: string; publishedAt?: string | null }>>(`${moduleMeta(tab).path}?${qs(params)}`);
			if (seq !== searchSeq) return;
			const rowsIn = res.data.map((c) => ({ id: c.id, title: c.title, date: (c.publishedAt ?? '').slice(0, 10) }));
			// A page can overlap the last when items were added meanwhile; each id may appear once (the list is keyed by it).
			const seen = new Set(reset ? [] : candidates.map((c) => c.id));
			candidates = reset ? rowsIn : [...candidates, ...rowsIn.filter((c) => !seen.has(c.id))];
			total = res.total;
			nextPage += 1;
		} catch {
			if (seq === searchSeq && reset) {
				candidates = [];
				total = 0;
			}
		} finally {
			if (seq === searchSeq) {
				searching = false;
				loadingMore = false;
			}
		}
	}

	// A new kind, search text or filter restarts the list from its first page.
	$effect(() => {
		void [tab, query, categoryId, dateFrom, dateTo];
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => void fetchPage(true), 250);
		return () => clearTimeout(searchTimer);
	});

	const hasMore = $derived(candidates.length < total);

	/** Loads the next page when scrolled into view; re-created after each page so a still-visible end keeps loading. */
	function endOfList(node: HTMLElement) {
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !searching && !loadingMore) void fetchPage(false);
			},
			{ root: node.parentElement, rootMargin: '60px' }
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}

	onMount(() => {
		void lookups.ensureCategories();
		return () => clearTimeout(searchTimer);
	});

	function shiftMonth(by: number) {
		const d = new Date(cursor.year, cursor.month + by, 1);
		cursor = { year: d.getFullYear(), month: d.getMonth() };
	}

	function goTo(key: string) {
		selected = key;
		const d = parseKey(key);
		if (d.getFullYear() !== cursor.year || d.getMonth() !== cursor.month) cursor = { year: d.getFullYear(), month: d.getMonth() };
	}

	async function save(advance: boolean) {
		if (!picked) return toast.error('Pick an item first');
		busy = true;
		try {
			const row = await api.put<ScheduleRow>(`/api/popup/schedule/${selected}`, { module: tab, contentId: picked.id });
			rows = { ...rows, [row.date]: row };
			toast.success(`Saved for ${selected}`);
			if (advance) goTo(addDays(selected, 1));
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Could not save');
		} finally {
			busy = false;
		}
	}

	async function clearDay() {
		busy = true;
		try {
			await api.delete(`/api/popup/schedule/${selected}`);
			const next = { ...rows };
			delete next[selected];
			rows = next;
			toast.success(`${selected} will use the random pick`);
		} catch {
			toast.error('Could not clear the day');
		} finally {
			busy = false;
		}
	}

	const unchanged = $derived(!!current && !!picked && current.module === tab && current.contentId === picked.id);
	const pickedKind = $derived(picked && current && current.contentId === picked.id ? current.module : tab);
</script>

<div class="mx-auto max-w-6xl p-4 sm:p-5">
	<div class="mb-4">
		<h1 class="text-2xl font-bold tracking-tight">Daily Popup</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Choose what the app's popup shows each day. A day with nothing chosen shows a random malfuzat. Click a day, pick an item, save, and carry on to the next day without leaving this page.
		</p>
	</div>

	<div class="grid gap-4 lg:grid-cols-[1fr_380px]">
		<Card>
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">{monthLabel(cursor.year, cursor.month)}</h2>
				<div class="flex items-center gap-1">
					<Button size="icon-sm" variant="outline" aria-label="Previous month" onclick={() => shiftMonth(-1)}><ChevronLeft class="h-4 w-4" /></Button>
					<Button size="sm" variant="outline" onclick={() => goTo(todayKey)}>Today</Button>
					<Button size="icon-sm" variant="outline" aria-label="Next month" onclick={() => shiftMonth(1)}><ChevronRight class="h-4 w-4" /></Button>
				</div>
			</div>

			<div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
				{#each WEEKDAYS as w (w)}<div class="py-1">{w}</div>{/each}
			</div>
			<div class="grid grid-cols-7 gap-1" class:opacity-60={loading}>
				{#each grid as key (key)}
					{@const row = rows[key]}
					{@const inMonth = parseKey(key).getMonth() === cursor.month}
					<button
						type="button"
						onclick={() => goTo(key)}
						class="flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors hover:bg-muted/60 {key === selected ? 'border-primary ring-2 ring-primary/30' : 'border-border'} {inMonth ? 'bg-card' : 'bg-muted/30 text-muted-foreground'}"
					>
						<span class="flex items-center justify-between text-xs font-semibold">
							<span class={key === todayKey ? 'rounded-full bg-primary px-1.5 text-primary-foreground' : ''}>{parseKey(key).getDate()}</span>
							{#if row && !isShowable(row)}<span class="text-[10px] font-medium text-destructive" title="Missing or unpublished: the app shows a random pick">!</span>{/if}
						</span>
						{#if row}
							<span class="truncate rounded px-1 text-[10px] font-semibold uppercase {moduleMeta(row.module).cls}">{moduleMeta(row.module).label}</span>
							<span class="line-clamp-2 text-[11px] leading-tight">{row.title || 'Untitled'}</span>
						{:else}
							<span class="mt-auto text-[11px] italic text-muted-foreground">Random</span>
						{/if}
					</button>
				{/each}
			</div>
		</Card>

		<Card title={new Date(parseKey(selected)).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}>
			{#if current}
				<div class="rounded-lg border bg-muted/40 p-3 text-sm">
					<p class="text-xs font-medium uppercase text-muted-foreground">Scheduled</p>
					<p class="mt-1 font-semibold">{current.title || 'Untitled'}</p>
					<span class="mt-1 inline-block rounded px-1.5 text-xs font-semibold {moduleMeta(current.module).cls}">{moduleMeta(current.module).label}</span>
					{#if !isShowable(current)}
						<p class="mt-2 text-xs text-destructive">{current.exists ? 'This item is unpublished' : 'This item was deleted'}: the app shows a random pick until you choose another.</p>
					{/if}
				</div>
			{:else}
				<div class="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Nothing chosen: the app shows a random malfuzat on this day.</div>
			{/if}

			<Tabs tabs={POPUP_MODULES} value={tab} onchange={(id) => (tab = id as PopupModule)} />
			<input bind:value={query} placeholder="Search {moduleMeta(tab).label}…" class={inp('w-full')} />

			<div class="space-y-2">
				<Combobox options={categories} bind:value={categoryId} placeholder="All categories" searchPlaceholder="Search categories..." clearable filter class="w-full" />
				<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span class="w-9 shrink-0">From</span>
					<Select value={fromYear} options={YEARS} filter class="w-24" onchange={(v) => (fromYear = v)} />
					<Select value={fromMonth} options={MONTHS} filter class="flex-1" onchange={(v) => (fromMonth = v)} />
				</div>
				<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span class="w-9 shrink-0">To</span>
					<Select value={toYear} options={YEARS} filter class="w-24" onchange={(v) => (toYear = v)} />
					<Select value={toMonth} options={MONTHS} filter class="flex-1" onchange={(v) => (toMonth = v)} />
				</div>
				{#if filtered}
					<Button variant="ghost" size="sm" class="gap-1" onclick={clearFilters}><X class="h-3.5 w-3.5" /> Clear filters</Button>
				{/if}
			</div>

			<ul class="max-h-72 divide-y divide-border overflow-y-auto rounded-lg border" class:opacity-60={searching}>
				{#each candidates as c (c.id)}
					<li>
						<button
							type="button"
							onclick={() => (picked = c)}
							class="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60 {picked?.id === c.id ? 'bg-primary/10 font-semibold' : ''}"
						>
							<span>{c.title || 'Untitled'}</span>
							{#if c.date}<span class="shrink-0 text-[11px] font-normal text-muted-foreground">{c.date}</span>{/if}
						</button>
					</li>
				{/each}
				{#if hasMore}
					{#key candidates.length}
						<li use:endOfList class="px-3 py-3 text-center text-xs text-muted-foreground">Loading more…</li>
					{/key}
				{:else if candidates.length === 0}
					<li class="px-3 py-4 text-center text-sm text-muted-foreground">{searching ? 'Searching…' : 'Nothing found.'}</li>
				{/if}
			</ul>
			{#if total > 0}<p class="-mt-2 text-right text-[11px] text-muted-foreground">{candidates.length} of {total}</p>{/if}

			{#if picked}
				<p class="text-sm"><span class="text-muted-foreground">Chosen:</span> <span class="font-semibold">{picked.title || 'Untitled'}</span> <span class="text-xs text-muted-foreground">({moduleMeta(pickedKind).label})</span></p>
			{/if}

			<div class="flex flex-wrap gap-2">
				<Button disabled={busy || !picked || unchanged} onclick={() => save(false)}>Save</Button>
				<Button variant="secondary" disabled={busy || !picked || unchanged} onclick={() => save(true)}>Save &amp; next day</Button>
				{#if current}<Button variant="outline" disabled={busy} onclick={clearDay}>Use random</Button>{/if}
			</div>
		</Card>
	</div>
</div>
