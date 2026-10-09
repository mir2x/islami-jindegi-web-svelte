<script lang="ts" module>
	export interface ComboOption {
		id: string;
		label: string;
		/** Child entries (sub-categories) render muted and indented. */
		child?: boolean;
	}
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import X from '@lucide/svelte/icons/x';
	import { cn } from '#lib/utils.ts';
	import { popupCls, triggerCls } from './classes.ts';

	interface Props {
		options: ComboOption[];
		/** Selected id (single mode) or ids (multiple mode). */
		value: string | string[];
		multiple?: boolean;
		placeholder: string;
		searchPlaceholder?: string;
		emptyText?: string;
		/** Single mode: show a clear button and let a second click on the selection clear it. */
		clearable?: boolean;
		/** Highlights the trigger while a value is chosen (filter bars). */
		filter?: boolean;
		/** Trigger text for a non-empty multi selection; defaults to "N selected". */
		selectedText?: (count: number) => string;
		/** Server-side search: called (with the current text) as the user types; local filtering is skipped. */
		onsearch?: (query: string) => void;
		/** Label for the current value when it is not among `options` (e.g. a remote result no longer listed). */
		valueLabel?: string;
		onchange?: (value: string | string[]) => void;
		class?: string;
		/** Extra classes for the trigger button; defaults to the card background used in filter bars. */
		triggerClass?: string;
		popupClass?: string;
	}

	let {
		options,
		value = $bindable(),
		multiple = false,
		placeholder,
		searchPlaceholder = 'Search...',
		emptyText = 'Nothing found.',
		clearable = false,
		filter = false,
		selectedText,
		onsearch,
		valueLabel,
		onchange,
		class: className,
		triggerClass = 'bg-card',
		popupClass
	}: Props = $props();

	let open = $state(false);
	let query = $state('');
	let root = $state<HTMLElement>();

	const selected = $derived(Array.isArray(value) ? value : value ? [value] : []);
	const shown = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return q && !onsearch ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
	});
	const triggerLabel = $derived(
		multiple ? (selected.length ? (selectedText?.(selected.length) ?? `${selected.length} selected`) : '') : (options.find((o) => o.id === value)?.label ?? valueLabel ?? '')
	);

	function commit(next: string | string[]) {
		value = next;
		onchange?.(next);
	}

	function pick(id: string) {
		if (multiple) {
			commit(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
			return;
		}
		commit(clearable && value === id ? '' : id);
		open = false;
	}

	$effect(() => {
		if (!open) query = '';
	});
	// Remote search also loads its first page when the list opens (empty query).
	$effect(() => {
		if (open) onsearch?.(query);
	});
</script>

<svelte:window onpointerdown={(e) => open && root && !root.contains(e.target as Node) && (open = false)} onkeydown={(e) => open && e.key === 'Escape' && (open = false)} />

<div class={cn('relative', className)} bind:this={root}>
	<button
		type="button"
		aria-haspopup="listbox"
		aria-expanded={open}
		class={cn(triggerCls, 'h-9 rounded-md px-3', triggerClass, filter && selected.length && 'border-primary', !triggerLabel && 'text-muted-foreground')}
		onclick={() => (open = !open)}
	>
		<span class="truncate">{triggerLabel || placeholder}</span>
		<ChevronsUpDown class="size-3.5 shrink-0 opacity-50" />
	</button>
	{#if clearable && !multiple && value}
		<button type="button" aria-label="Clear" class="absolute right-7 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground" onclick={() => commit('')}
			><X class="size-3.5" /></button
		>
	{/if}

	{#if open}
		<div class={cn(popupCls, 'absolute left-0 top-full mt-1 w-full min-w-56', popupClass)}>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				autofocus
				bind:value={query}
				placeholder={searchPlaceholder}
				class="w-full border-b border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
			/>
			<ul role="listbox" class="max-h-64 overflow-y-auto p-1">
				{#each shown as o (o.id)}
					{@const on = selected.includes(o.id)}
					<li role="option" aria-selected={on}>
						<button
							type="button"
							class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
							onclick={() => pick(o.id)}
						>
							<Check class={cn('size-4 shrink-0', on ? 'opacity-100' : 'opacity-0')} />
							<span class={o.child ? 'pl-3 text-muted-foreground' : 'font-medium'}>{o.label}</span>
						</button>
					</li>
				{:else}
					<li class="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
