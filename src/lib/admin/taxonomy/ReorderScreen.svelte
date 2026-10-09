<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import { page } from '$app/state';
	import { moduleLabel } from '#lib/modules.ts';
	import { ApiError } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import DragList from '../ui/DragList.svelte';
	import Field from '../ui/Field.svelte';
	import Select from '../ui/Select.svelte';
	import Skeleton from '../ui/Skeleton.svelte';

	interface Item {
		id: string;
		label: string;
		/** Position within the module being ordered. */
		position: number;
	}
	interface Props {
		heading: string;
		/** The list this screen came from, for Back in a fresh tab. */
		listHref: string;
		noun: string;
		modules: readonly { key: string; label: string }[];
		loading: boolean;
		/** Items belonging to `module`, in their saved order. */
		itemsFor: (module: string) => Item[];
		save: (module: string, ids: string[]) => Promise<void>;
	}
	let { heading, listHref, noun, modules, loading, itemsFor, save }: Props = $props();

	const requested = page.url.searchParams.get('module');
	// svelte-ignore state_referenced_locally
	let module = $state(modules.some((m) => m.key === requested) ? requested! : modules[0].key);
	// Draft order per module, as ids: switching modules just reads a different entry.
	let drafts = $state<Record<string, string[]>>({});
	let saving = $state(false);

	const saved = $derived(itemsFor(module));
	const draft = $derived(drafts[module]);
	// The draft holds ids; resolve them against the live data so a refetch cannot desync them.
	const items = $derived.by(() => {
		if (!draft) return saved;
		const byId = new Map(saved.map((i) => [i.id, i]));
		return draft.map((id) => byId.get(id)).filter((i): i is Item => !!i);
	});

	function move(from: number, to: number) {
		if (to < 0 || to >= items.length || from === to) return;
		const next = items.map((i) => i.id);
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		drafts[module] = next;
	}

	async function onsave() {
		saving = true;
		try {
			await save(
				module,
				items.map((i) => i.id)
			);
			toast.success(`${moduleLabel(module)} order saved`);
			delete drafts[module];
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Could not save the order');
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-4 sm:p-5">
	<div class="mb-4">
		<button type="button" onclick={() => goBack(listHref)} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
			><ArrowLeft class="w-4 h-4" /> Back</button
		>
		<h1 class="text-2xl font-bold">{heading}</h1>
		<p class="text-sm text-muted-foreground mt-1">Each module has its own order. Changing it here affects only the selected module.</p>
	</div>

	<Card>
		<div class="flex items-end gap-3">
			<Field label="Module" class="flex-1 max-w-56"><Select bind:value={module} options={modules.map((m) => ({ value: m.key, label: m.label }))} /></Field>
			<Button onclick={onsave} disabled={!draft || saving}><Save class="w-4 h-4" /> {saving ? 'Saving...' : 'Save order'}</Button>
		</div>

		{#if loading}
			<div class="space-y-2">
				{#each { length: 6 } as _, i (i)}<Skeleton class="h-11 w-full" />{/each}
			</div>
		{:else if items.length === 0}
			<p class="text-sm text-muted-foreground py-8 text-center">No {noun} are assigned to {moduleLabel(module)} yet.</p>
		{:else}
			<DragList items={items.map((i) => ({ id: i.id, label: i.label }))} onmove={move} />
		{/if}

		{#if draft}<p class="text-xs text-muted-foreground">Unsaved changes: positions are written as 1 to {items.length} when you save.</p>{/if}
	</Card>
</div>
