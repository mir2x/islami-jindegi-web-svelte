<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Merge from '@lucide/svelte/icons/merge';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Tag from '@lucide/svelte/icons/tag';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { SvelteSet } from 'svelte/reactivity';
	import { untrack } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import { moduleLabel } from '#lib/modules.ts';
	import type { Category, ModuleUsage } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
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
	const loader = new PagedLoader<Category>('/api/categories/paged');
	let search = $state('');
	let page = $state(1);
	let sort = $state(parseSort('position_desc'));
	let deleting = $state<Category | null>(null);
	let merging = $state<Category | null>(null);
	let busy = $state(false);
	let usage = $state<ModuleUsage[] | null>(null);
	// What has been collapsed, not what is expanded: parents start expanded, so new rows need no state sync.
	const collapsed = new SvelteSet<string>();

	const result = $derived(loader.result);
	const load = () => loader.load({ page, pageSize: PAGE_SIZE, search, sort: sortParam(sort) });

	$effect(() => void load());
	// The merge dialog picks its target from the full tree, not just the current page.
	$effect(() => void untrack(() => lookups.ensureCategories()));

	async function openUsage(c: Category) {
		usage = null;
		try {
			usage = await api.get<ModuleUsage[]>(`/api/categories/${c.id}/usage`);
		} catch {
			usage = [];
		}
	}

	async function refresh() {
		lookups.invalidate('categories');
		await Promise.all([load(), lookups.ensureCategories()]);
	}

	async function remove() {
		if (!deleting) return;
		busy = true;
		try {
			await api.delete(`/api/categories/${deleting.id}`);
			toast.success('Category deleted');
			deleting = null;
			await refresh();
		} catch {
			toast.error('Failed to delete: category may have books or subcategories linked to it');
		} finally {
			busy = false;
		}
	}

	async function merge(targetId: string) {
		if (!merging) return;
		busy = true;
		try {
			await api.post(`/api/categories/${merging.id}/merge`, { targetId });
			const all = lookups.categories.flatMap((c) => [c, ...c.children]);
			toast.success(`Merged into "${all.find((c) => c.id === targetId)?.title ?? 'category'}"`);
			merging = null;
			await refresh();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Merge failed');
		} finally {
			busy = false;
		}
	}

	const mergeOptions = $derived(lookups.categories.filter((c) => c.id !== merging?.id).map((c) => ({ id: c.id, label: c.title })));
	const btn = 'h-8 w-8 text-muted-foreground hover:text-foreground';
	const rowActions = 'flex items-center gap-1 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity';
</script>

<ListPage
	title="Categories"
	total={result?.total ?? null}
	countInTitle
	addHref="/admin/categories/new"
	addLabel="Add Category"
	{page}
	totalPages={loader.totalPages}
	onpage={(p) => (page = p)}
>
	{#snippet actions()}<Button variant="outline" href={localePath('/admin/categories/reorder')} class="gap-2"><ListOrdered class="w-4 h-4" /> Reorder</Button>{/snippet}
	{#snippet filters()}
		<div class="relative max-w-sm w-full">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<input
				placeholder="Search categories..."
				value={search}
				oninput={(e) => {
					search = e.currentTarget.value;
					page = 1;
				}}
				class={inp('pl-9 bg-card')}
			/>
		</div>
	{/snippet}

	<DataTable widths={['', 'w-20', 'w-56', 'w-24', 'w-36']} minWidth="min-w-[760px]">
		{#snippet head()}
			{@const onsort = (k: string) => {
				sort = toggleSort(sort, k);
				page = 1;
			}}
			<SortHeader label="Title" sortKey="title" {sort} {onsort} />
			<SortHeader label="Subs" sortKey="subs" {sort} {onsort} />
			<SortHeader label="Modules" sortKey="modules" {sort} {onsort} />
			<SortHeader label="Position" sortKey="position" {sort} {onsort} />
			<th class="px-5 py-3.5"></th>
		{/snippet}

		{#if loader.loading && !result}
			{#each { length: PAGE_SIZE } as _, i (i)}
				<tr>
					<td class="px-5 py-4"><Skeleton class="h-4 w-56" /></td><td class="px-5 py-4"><Skeleton class="h-3.5 w-8" /></td><td class="px-5 py-4"><Skeleton class="h-3.5 w-40" /></td
					>
					<td class="px-5 py-4"><Skeleton class="h-3.5 w-6" /></td><td class="px-5 py-4"><Skeleton class="h-8 w-16 rounded-lg" /></td>
				</tr>
			{/each}
		{:else if result && result.data.length === 0}
			<TableEmpty colspan={5} icon="tag" title="No categories found" hint={search ? 'Try a different search' : 'Add your first category to get started'} />
		{:else if result}
			{#each result.data as parent (parent.id)}
				{@const open = !collapsed.has(parent.id)}
				<tr class="hover:bg-muted/30 transition-colors group" class:opacity-60={loader.loading}>
					<td class="px-5 py-4">
						<div class="flex items-center gap-2 min-w-0">
							<button
								type="button"
								disabled={parent.children.length === 0}
								aria-label={open ? 'Collapse' : 'Expand'}
								onclick={() => (open ? collapsed.add(parent.id) : collapsed.delete(parent.id))}
								class="shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-default"
							>
								<ChevronRight class={cn('w-4 h-4 transition-transform', open && parent.children.length > 0 && 'rotate-90')} />
							</button>
							<FolderOpen class="w-4 h-4 text-primary shrink-0" />
							<span class="font-semibold truncate">{parent.title}</span>
						</div>
					</td>
					<td class="px-5 py-4"><span class="text-sm text-muted-foreground">{parent.children.length || '—'}</span></td>
					<td class="px-5 py-4">
						{#if parent.modules?.length}
							<div class="flex flex-wrap gap-1">
								{#each parent.modules as m (m.module)}<span
										title="Position {m.position} in {moduleLabel(m.module)}"
										class="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{moduleLabel(m.module)}</span
									>{/each}
							</div>
						{:else}<span class="text-sm text-muted-foreground">— not in any module</span>{/if}
					</td>
					<td class="px-5 py-4"><span class="text-sm font-mono text-muted-foreground">{parent.position}</span></td>
					<td class="px-5 py-4">
						<div class={rowActions}>
							<Button
								variant="ghost"
								size="icon"
								title="Add subcategory"
								aria-label="Add subcategory"
								href={localePath(`/admin/categories/new?parentId=${parent.id}`)}
								class="h-8 w-8 text-muted-foreground hover:text-primary"><Plus class="w-3.5 h-3.5" /></Button
							>
							<Button variant="ghost" size="icon" aria-label="Edit" class={btn} onclick={(e) => adminNavigate(`/admin/categories/${parent.id}/edit`, e)}
								><Pencil class="w-3.5 h-3.5" /></Button
							>
							<Button
								variant="ghost"
								size="icon"
								title="Merge into another category"
								aria-label="Merge"
								class={btn}
								onclick={() => {
									merging = parent;
									void openUsage(parent);
								}}><Merge class="w-3.5 h-3.5" /></Button
							>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Delete"
								class="h-8 w-8 text-muted-foreground hover:text-destructive"
								onclick={() => {
									deleting = parent;
									void openUsage(parent);
								}}><Trash2 class="w-3.5 h-3.5" /></Button
							>
						</div>
					</td>
				</tr>
				{#if open}
					{#each parent.children as child (child.id)}
						<tr class="bg-muted/20 hover:bg-muted/30 transition-colors group">
							<td class="px-5 py-3"
								><div class="flex items-center gap-2 min-w-0 pl-8">
									<Tag class="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span class="text-sm text-foreground/80 truncate">{child.title}</span>
								</div></td
							>
							<td class="px-5 py-3"></td><td class="px-5 py-3"></td>
							<td class="px-5 py-3"><span class="text-sm font-mono text-muted-foreground">{child.position}</span></td>
							<td class="px-5 py-3">
								<div class={rowActions}>
									<Button variant="ghost" size="icon" aria-label="Edit" class={btn} onclick={(e) => adminNavigate(`/admin/categories/${child.id}/edit`, e)}
										><Pencil class="w-3.5 h-3.5" /></Button
									>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="h-8 w-8 text-muted-foreground hover:text-destructive"
										onclick={() => {
											deleting = child;
											void openUsage(child);
										}}><Trash2 class="w-3.5 h-3.5" /></Button
									>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			{/each}
		{/if}
	</DataTable>

	{#snippet after()}
		<DeleteDialog
			noun="category"
			subject={deleting?.title ?? null}
			{usage}
			{busy}
			consequence="along with its place in every module list"
			texts={{ loading: 'Checking what is attached…', some: 'Still attached to', after: 'Merging keeps that content; deleting does not.', none: 'No content is attached.' }}
			onconfirm={remove}
			oncancel={() => (deleting = null)}
		>
			{#snippet extra()}
				{#if deleting && !deleting.parentId && deleting.children?.length > 0}<span class="block mt-1 text-destructive"
						>This category has {deleting.children.length} subcategories: delete them first.</span
					>{/if}
			{/snippet}
		</DeleteDialog>
		<MergeDialog noun="category" subject={merging?.title ?? null} options={mergeOptions} {usage} {busy} onmerge={merge} oncancel={() => (merging = null)} />
	{/snippet}
</ListPage>
