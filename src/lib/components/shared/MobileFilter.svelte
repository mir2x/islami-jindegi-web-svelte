<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Modal from '#lib/components/ui/Modal.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { FilterOption } from '#lib/filters.ts';
	import { cn } from '#lib/utils.ts';
	import SearchInput from './SearchInput.svelte';

	interface Props {
		title: string;
		/** Options already loaded; shown instantly. Typing switches to live search through `fetchOptions`. */
		options: FilterOption[];
		fetchOptions?: (search: string) => Promise<FilterOption[]>;
		selected: string;
		onselect: (id: string) => void;
		emptyText: string;
	}
	let { title, options, fetchOptions, selected, onselect, emptyText }: Props = $props();

	const t = useT('Common');
	let open = $state(false);
	let query = $state('');
	let result = $state<FilterOption[] | null>(null);
	let loading = $state(false);

	const activeLabel = $derived(options.find((o) => o.id === selected)?.label);
	const items = $derived(fetchOptions && query.trim() && result ? result : options);

	// Debounced live search; a stale reply never overwrites a newer one.
	$effect(() => {
		const q = query.trim();
		if (!open || !fetchOptions || !q) return;
		let cancelled = false;
		const timer = setTimeout(async () => {
			loading = true;
			const found = await fetchOptions(q);
			if (!cancelled) result = found;
			loading = false;
		}, 300);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});

	function show() {
		query = '';
		result = null;
		open = true;
	}
	const pick = (id: string) => {
		onselect(id);
		open = false;
	};
	const rowClass = (active: boolean) =>
		cn(
			'w-full flex items-center gap-2.5 text-left px-3 py-3 rounded-xl text-base transition-colors',
			active ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
		);
</script>

<!-- Mobile-only select-style button that opens a centred picker. -->
<button
	type="button"
	onclick={show}
	class={cn(
		'flex-1 min-w-0 flex items-center justify-between gap-1.5 px-3.5 py-2.5 rounded-xl border text-base font-medium transition-colors',
		activeLabel ? 'border-primary bg-primary/8 text-primary' : 'border-border bg-muted text-muted-foreground'
	)}
>
	<span class="truncate">{activeLabel ?? title}</span>
	<ChevronDown class="w-4 h-4 shrink-0 opacity-60" />
</button>

<Modal {open} {title} onclose={() => (open = false)} class="lg:hidden">
	<div class="p-4 pb-2 shrink-0"><SearchInput value={query} onchange={(v) => (query = v)} placeholder={t('searchShort')} /></div>
	<div class="flex-1 overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
		<button type="button" onclick={() => pick('')} class={rowClass(selected === '')}>
			<Check class={cn('w-4 h-4 shrink-0', selected === '' ? 'opacity-100' : 'opacity-0')} />{t('all')}
		</button>
		{#if loading}
			<div class="space-y-2 px-3 py-2">
				{#each Array(5) as _, i (i)}<div class="h-9 rounded-lg bg-muted animate-pulse"></div>{/each}
			</div>
		{:else if items.length === 0}
			<p class="text-base text-muted-foreground px-3 py-6 text-center">{emptyText}</p>
		{:else}
			{#each items as item (item.id)}
				<button type="button" onclick={() => pick(item.id)} class={rowClass(selected === item.id)}>
					<Check class={cn('w-4 h-4 shrink-0', selected === item.id ? 'opacity-100' : 'opacity-0')} />
					<span>{item.label}</span>
				</button>
			{/each}
		{/if}
	</div>
</Modal>
