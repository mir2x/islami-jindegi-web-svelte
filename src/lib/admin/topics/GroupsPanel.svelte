<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { TopicGroupAdmin } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import { moved } from './topic-helpers.ts';

	let { groups, onchanged }: { groups: TopicGroupAdmin[]; onchanged: () => Promise<void> } = $props();

	let newTitle = $state('');
	let renaming = $state<{ id: string; title: string } | null>(null);
	let deleting = $state<TopicGroupAdmin | null>(null);
	let busy = $state(false);

	async function run(action: () => Promise<unknown>, success: string, failure: string) {
		busy = true;
		try {
			await action();
			toast.success(success);
			await onchanged();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : failure);
		} finally {
			busy = false;
		}
	}

	const reorder = (i: number, to: number) =>
		run(
			() =>
				api.put('/api/topics/groups/reorder', {
					groupIds: moved(
						groups.map((g) => g.id),
						i,
						to
					)
				}),
			'Order saved',
			'Could not reorder'
		);
</script>

<Card>
	<div>
		<h2 class="text-lg font-semibold">Groups</h2>
		<p class="text-sm text-muted-foreground mt-0.5">Headings on the public topics page, in this order. Topics without a group are listed after them.</p>
	</div>

	<form
		class="flex gap-2"
		onsubmit={(e) => {
			e.preventDefault();
			const title = newTitle.trim();
			if (title)
				void run(
					async () => {
						await api.post('/api/topics/groups', { title });
						newTitle = '';
					},
					'Group added',
					'Could not add the group'
				);
		}}
	>
		<input bind:value={newTitle} placeholder="New group, e.g. ইবাদত" class={inputCls} />
		<Button type="submit" disabled={busy || !newTitle.trim()}><Plus class="w-4 h-4" /> Add</Button>
	</form>

	{#if groups.length === 0}
		<p class="text-sm text-muted-foreground py-4 text-center">No groups yet: the public page shows every topic in one grid.</p>
	{:else}
		<ul class="space-y-1.5">
			{#each groups as g, i (g.id)}
				<li class="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
					<span class="w-6 text-xs text-muted-foreground tabular-nums shrink-0">{i + 1}</span>
					{#if renaming?.id === g.id}
						<form
							class="flex flex-1 gap-2"
							onsubmit={(e) => {
								e.preventDefault();
								const title = renaming!.title.trim();
								if (title)
									void run(
										async () => {
											await api.put(`/api/topics/groups/${g.id}`, { title });
											renaming = null;
										},
										'Group renamed',
										'Could not rename the group'
									);
							}}
						>
							<!-- svelte-ignore a11y_autofocus -->
							<input autofocus bind:value={renaming.title} class={inp('h-8')} />
							<Button type="submit" size="sm" disabled={busy}>Save</Button>
							<Button size="sm" variant="ghost" onclick={() => (renaming = null)}>Cancel</Button>
						</form>
					{:else}
						<span class="flex-1 text-sm truncate">{g.title}</span>
						<div class="flex shrink-0">
							<Button variant="ghost" size="icon" class="h-7 w-7" aria-label="Move up" disabled={busy || i === 0} onclick={() => reorder(i, i - 1)}
								><ChevronUp class="w-4 h-4" /></Button
							>
							<Button variant="ghost" size="icon" class="h-7 w-7" aria-label="Move down" disabled={busy || i === groups.length - 1} onclick={() => reorder(i, i + 1)}
								><ChevronDown class="w-4 h-4" /></Button
							>
							<Button variant="ghost" size="icon" class="h-7 w-7" aria-label="Rename" onclick={() => (renaming = { id: g.id, title: g.title })}
								><Pencil class="w-3.5 h-3.5" /></Button
							>
							<Button variant="ghost" size="icon" class="h-7 w-7 text-destructive" aria-label="Delete" onclick={() => (deleting = g)}><Trash2 class="w-3.5 h-3.5" /></Button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</Card>

<ConfirmDialog
	open={!!deleting}
	title="Delete group “{deleting?.title}”?"
	{busy}
	onconfirm={() =>
		deleting &&
		run(
			async () => {
				await api.delete(`/api/topics/groups/${deleting!.id}`);
				deleting = null;
			},
			'Group deleted',
			'Could not delete the group'
		)}
	oncancel={() => (deleting = null)}
>
	Its topics are not deleted. They move to “no group” and go back to automatic order.
</ConfirmDialog>
