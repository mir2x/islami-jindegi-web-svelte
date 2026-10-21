<script lang="ts">
	import Save from '@lucide/svelte/icons/save';
	import type { AuthorBrowseAdminItem } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import DragList from '../ui/DragList.svelte';
	import { UNGROUPED, moved } from './author-browse-helpers.ts';

	interface Props {
		/** A group id, or UNGROUPED. */
		groupKey: string;
		authors: AuthorBrowseAdminItem[];
		onchanged: () => Promise<void>;
	}
	let { groupKey, authors, onchanged }: Props = $props();

	// Draft order as ids, resolved against live data so a refetch cannot desync it.
	let draft = $state<string[] | null>(null);
	let saving = $state(false);

	const items = $derived.by(() => {
		if (!draft) return authors;
		const byId = new Map(authors.map((t) => [t.authorId, t]));
		return draft.map((id) => byId.get(id)).filter((t): t is AuthorBrowseAdminItem => !!t);
	});

	async function save() {
		saving = true;
		try {
			await api.put('/api/authors/browse/admin/reorder', { groupId: groupKey === UNGROUPED ? null : groupKey, authorIds: items.map((t) => t.authorId) });
			toast.success('Order saved');
			draft = null;
			await onchanged();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Could not save the order');
		} finally {
			saving = false;
		}
	}
</script>

<Card>
	<div class="flex items-start justify-between gap-3">
		<div>
			<h2 class="text-lg font-semibold">Order</h2>
			<p class="text-sm text-muted-foreground mt-0.5">Until you save an order, authors are sorted by how much content they have.</p>
		</div>
		<Button onclick={save} disabled={!draft || saving}><Save class="w-4 h-4" /> {saving ? 'Saving...' : 'Save order'}</Button>
	</div>

	{#if items.length === 0}
		<p class="text-sm text-muted-foreground py-6 text-center">No authors in this group.</p>
	{:else}
		<DragList
			items={items.map((t) => ({ id: t.authorId, label: t.name, badge: t.hidden ? 'Hidden' : undefined, dim: t.hidden || t.total === 0 }))}
			onmove={(from, to) =>
				from !== to &&
				to >= 0 &&
				to < items.length &&
				(draft = moved(
					items.map((t) => t.authorId),
					from,
					to
				))}
		/>
	{/if}
</Card>
