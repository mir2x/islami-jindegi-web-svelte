<script lang="ts">
	import Save from '@lucide/svelte/icons/save';
	import type { TopicAdminItem } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import DragList from '../ui/DragList.svelte';
	import { UNGROUPED, moved } from './topic-helpers.ts';

	interface Props {
		/** A group id, or UNGROUPED. */
		groupKey: string;
		topics: TopicAdminItem[];
		onchanged: () => Promise<void>;
	}
	let { groupKey, topics, onchanged }: Props = $props();

	// Draft order as ids, resolved against live data so a refetch cannot desync it.
	let draft = $state<string[] | null>(null);
	let saving = $state(false);

	const items = $derived.by(() => {
		if (!draft) return topics;
		const byId = new Map(topics.map((t) => [t.categoryId, t]));
		return draft.map((id) => byId.get(id)).filter((t): t is TopicAdminItem => !!t);
	});

	async function save() {
		saving = true;
		try {
			await api.put('/api/topics/admin/reorder', { groupId: groupKey === UNGROUPED ? null : groupKey, categoryIds: items.map((t) => t.categoryId) });
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
			<p class="text-sm text-muted-foreground mt-0.5">Until you save an order, topics are sorted by how much content they have.</p>
		</div>
		<Button onclick={save} disabled={!draft || saving}><Save class="w-4 h-4" /> {saving ? 'Saving...' : 'Save order'}</Button>
	</div>

	{#if items.length === 0}
		<p class="text-sm text-muted-foreground py-6 text-center">No topics in this group.</p>
	{:else}
		<DragList
			items={items.map((t) => ({ id: t.categoryId, label: t.title, badge: t.hidden ? 'Hidden' : undefined, dim: t.hidden || t.total === 0 }))}
			onmove={(from, to) =>
				from !== to &&
				to >= 0 &&
				to < items.length &&
				(draft = moved(
					items.map((t) => t.categoryId),
					from,
					to
				))}
		/>
	{/if}
</Card>
