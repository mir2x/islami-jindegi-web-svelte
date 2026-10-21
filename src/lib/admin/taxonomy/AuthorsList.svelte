<script lang="ts">
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Merge from '@lucide/svelte/icons/merge';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Search from '@lucide/svelte/icons/search';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import { moduleLabel } from '#lib/modules.ts';
	import type { Author, ModuleUsage } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import DataTable from '../list/DataTable.svelte';
	import ListPage from '../list/ListPage.svelte';
	import { PagedLoader } from '../list/loader.svelte.ts';
	import { parseSort, sortParam, toggleSort } from '../list/sort.ts';
	import TableEmpty from '../list/TableEmpty.svelte';
	import { lookups } from '../lookups.svelte.ts';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import Skeleton from '../ui/Skeleton.svelte';
	import SortHeader from '../ui/SortHeader.svelte';
	import DeleteDialog from './DeleteDialog.svelte';
	import MergeDialog from './MergeDialog.svelte';

	const PAGE_SIZE = 20;
	const loader = new PagedLoader<Author>('/api/authors');
	let search = $state('');
	let page = $state(1);
	let sort = $state(parseSort('position_desc'));
	let deleting = $state<Author | null>(null);
	let merging = $state<Author | null>(null);
	let busy = $state(false);
	// Content counts for whichever author is about to be deleted or merged: fetched on open, not per row.
	let usage = $state<ModuleUsage[] | null>(null);

	const result = $derived(loader.result);
	const load = () => loader.load({ page, pageSize: PAGE_SIZE, search, sort: sortParam(sort) });

	$effect(() => void load());
	// The merge dialog picks its target from every author, not just the current page.
	$effect(() => void untrack(() => lookups.ensureAuthors()));

	async function openUsage(author: Author) {
		usage = null;
		try {
			usage = await api.get<ModuleUsage[]>(`/api/authors/${author.id}/usage`);
		} catch {
			usage = [];
		}
	}

	async function refresh() {
		await Promise.all([load(), lookups.ensureAuthors()]);
	}

	async function remove() {
		if (!deleting) return;
		busy = true;
		try {
			await api.delete(`/api/authors/${deleting.id}`);
			toast.success('Author deleted');
			deleting = null;
			await refresh();
		} catch (err) {
			// The API refuses while the author still owns content: a delete used to cascade and take their bayan with it.
			toast.error(err instanceof ApiError ? err.message : 'Failed to delete author');
		} finally {
			busy = false;
		}
	}

	async function merge(targetId: string) {
		if (!merging) return;
		busy = true;
		try {
			await api.post(`/api/authors/${merging.id}/merge`, { targetId });
			toast.success(`Merged into "${lookups.authors.find((a) => a.id === targetId)?.name ?? 'author'}"`);
			merging = null;
			await refresh();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Merge failed');
		} finally {
			busy = false;
		}
	}

	const plain = (html: string) =>
		html
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	const mergeOptions = $derived(lookups.authors.filter((a) => a.id !== merging?.id).map((a) => ({ id: a.id, label: a.name })));
	const icon = 'h-8 w-8 text-muted-foreground hover:text-foreground';
</script>

<ListPage
	title="Authors"
	total={result?.total ?? null}
	unit="authors"
	addHref="/admin/authors/new"
	addLabel="Add Author"
	{page}
	totalPages={loader.totalPages}
	onpage={(p) => (page = p)}
>
	{#snippet actions()}<Button variant="outline" href={localePath('/admin/authors/browse')}>Author pages</Button><Button
			variant="outline"
			href={localePath('/admin/authors/reorder')}
			class="gap-2"><ListOrdered class="w-4 h-4" /> Reorder</Button
		>{/snippet}
	{#snippet filters()}
		<div class="relative max-w-sm w-full">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<input
				placeholder="Search authors..."
				value={search}
				oninput={(e) => {
					search = e.currentTarget.value;
					page = 1;
				}}
				class={inp('pl-9 bg-card')}
			/>
		</div>
	{/snippet}

	<DataTable widths={['', 'w-56', 'w-20', 'w-32']} minWidth="min-w-[680px]">
		{#snippet head()}
			{@const onsort = (k: string) => {
				sort = toggleSort(sort, k);
				page = 1;
			}}
			<SortHeader label="Author" sortKey="name" {sort} {onsort} />
			<SortHeader label="Appears in" sortKey="modules" {sort} {onsort} />
			<SortHeader label="Pos." sortKey="position" {sort} {onsort} />
			<th class="px-5 py-3.5"></th>
		{/snippet}

		{#if loader.loading && !result}
			{#each { length: PAGE_SIZE } as _, i (i)}
				<tr>
					<td class="px-5 py-4"><div class="space-y-2"><Skeleton class="h-4 w-40" /><Skeleton class="h-3 w-64" /></div></td>
					<td class="px-5 py-4"><Skeleton class="h-3.5 w-28" /></td>
					<td class="px-5 py-4"><Skeleton class="h-3.5 w-6" /></td>
					<td class="px-5 py-4"><Skeleton class="h-8 w-16" /></td>
				</tr>
			{/each}
		{:else if result && result.data.length === 0}
			<TableEmpty colspan={4} icon="users" title="No authors found" hint={search ? 'Try a different search' : 'Add your first author'} />
		{:else if result}
			{#each result.data as author (author.id)}
				<tr class="hover:bg-muted/30 transition-colors group" class:opacity-60={loader.loading}>
					<td class="px-5 py-4">
						<p class="font-semibold truncate">{author.name}</p>
						{#if author.info}<p class="text-sm text-muted-foreground line-clamp-1 mt-0.5">{plain(author.info)}</p>{/if}
					</td>
					<td class="px-5 py-4">
						{#if author.modules?.length}
							<div class="flex flex-wrap gap-1">
								{#each author.modules as m (m.module)}
									<span title="Position {m.position} in {moduleLabel(m.module)}" class="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
										>{moduleLabel(m.module)} <span class="tabular-nums opacity-70">#{m.position}</span></span
									>
								{/each}
							</div>
						{:else}<span class="text-xs text-muted-foreground/60">—</span>{/if}
					</td>
					<td class="px-5 py-4 text-sm text-muted-foreground">{author.position}</td>
					<td class="px-5 py-4">
						<div class="flex items-center gap-1 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
							<Button variant="ghost" size="icon" aria-label="Edit" class={icon} onclick={(e) => adminNavigate(`/admin/authors/${author.id}/edit`, e)}
								><Pencil class="w-3.5 h-3.5" /></Button
							>
							<Button
								variant="ghost"
								size="icon"
								title="Merge into another author"
								aria-label="Merge"
								class={icon}
								onclick={() => {
									merging = author;
									void openUsage(author);
								}}><Merge class="w-3.5 h-3.5" /></Button
							>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Delete"
								class="h-8 w-8 text-muted-foreground hover:text-destructive"
								onclick={() => {
									deleting = author;
									void openUsage(author);
								}}><Trash2 class="w-3.5 h-3.5" /></Button
							>
						</div>
					</td>
				</tr>
			{/each}
		{/if}
	</DataTable>

	{#snippet after()}
		<DeleteDialog
			noun="author"
			subject={deleting?.name ?? null}
			{usage}
			{busy}
			blockOnUsage
			consequence="along with their place in every module list"
			texts={{
				loading: 'Checking what is attributed to them…',
				some: 'Still has',
				after: 'Deleting is blocked until that content is moved: merge instead.',
				none: 'No content is attributed to them.'
			}}
			onconfirm={remove}
			oncancel={() => (deleting = null)}
		/>
		<MergeDialog noun="author" subject={merging?.name ?? null} options={mergeOptions} {usage} {busy} onmerge={merge} oncancel={() => (merging = null)} />
	{/snippet}
</ListPage>
