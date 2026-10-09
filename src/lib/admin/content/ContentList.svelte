<script lang="ts">
	import { onMount } from 'svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { api } from '../api.ts';
	import DataTable from '../list/DataTable.svelte';
	import ListPage from '../list/ListPage.svelte';
	import { PagedLoader } from '../list/loader.svelte.ts';
	import RowActions from '../list/RowActions.svelte';
	import { parseSort, sortParam, toggleSort } from '../list/sort.ts';
	import TableEmpty from '../list/TableEmpty.svelte';
	import { lookups } from '../lookups.svelte.ts';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import SortHeader from '../ui/SortHeader.svelte';
	import ContentCell from './ContentCell.svelte';
	import ListFilters from './ListFilters.svelte';
	import { recall, remember } from './list-memory.ts';
	import type { CellKind, ContentConfig } from './types.ts';

	const PAGE_SIZE = 20;
	// Skeleton shape per cell kind.
	const SKELETON: Record<CellKind, string> = {
		position: 'h-3.5 w-6',
		title: 'h-4 w-56',
		author: 'h-3.5 w-32',
		categories: 'h-5 w-24 rounded-full',
		language: 'h-5 w-16 rounded-full',
		location: 'h-3.5 w-24',
		date: 'h-3.5 w-20',
		longDate: 'h-3.5 w-24',
		status: 'h-5 w-20 rounded-full',
		audio: 'h-5 w-12 rounded-full',
		offline: 'h-5 w-9 rounded-full'
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Row = Record<string, any> & { id: string; title: string };

	let { config }: { config: ContentConfig } = $props();

	const t = useT('Common');
	// svelte-ignore state_referenced_locally
	let s = $state(recall(config.slug, config.defaultSort));
	// svelte-ignore state_referenced_locally
	const loader = new PagedLoader<Row>(`/api/${config.api}`);
	let deleting = $state<Row | null>(null);
	let deleteBusy = $state(false);

	const sort = $derived(parseSort(s.sort));
	const result = $derived(loader.result);
	const colspan = $derived(config.columns.length + 1);
	const widths = $derived([...config.columns.map((c) => c.width), 'w-28']);

	const load = () =>
		loader.load({
			page: s.page,
			pageSize: PAGE_SIZE,
			search: s.search,
			authorId: s.authorId,
			categoryId: s.categoryId,
			published: s.published,
			offlineAvailable: s.offline || undefined,
			sort: s.sort
		});

	onMount(() => void lookups.ensureAll());
	$effect(() => {
		remember(config.slug, { ...s });
		load();
	});

	async function setOffline(item: Row, value: boolean) {
		const prev = item.isOfflineAvailable;
		item.isOfflineAvailable = value;
		try {
			await api.patch(`/api/${config.api}/${item.id}/offline-availability`, { isOfflineAvailable: value });
		} catch {
			item.isOfflineAvailable = prev;
			toast.error(t('offlineUpdateFailed'));
		}
	}

	async function confirmDelete() {
		if (!deleting) return;
		deleteBusy = true;
		try {
			await api.delete(`/api/${config.api}/${deleting.id}`);
			toast.success('Deleted');
			deleting = null;
			load();
		} catch {
			toast.error('Failed to delete');
		} finally {
			deleteBusy = false;
		}
	}

	const edit = (id: string, e?: { ctrlKey: boolean; metaKey: boolean }) => adminNavigate(`/admin/${config.slug}/${id}/edit`, e);
</script>

<ListPage
	title={config.plural}
	total={result?.total ?? null}
	addHref="/admin/{config.slug}/new"
	addLabel="Add {config.toastName}"
	page={s.page}
	totalPages={loader.totalPages}
	onpage={(p) => (s.page = p)}
>
	{#snippet filters()}<ListFilters {config} bind:state={s} />{/snippet}

	<DataTable {widths}>
		{#snippet head()}
			{#each config.columns as col (col.kind + col.label)}
				{#if col.sort}
					<SortHeader
						label={col.label}
						sortKey={col.sort}
						{sort}
						onsort={(k) => {
							s.sort = sortParam(toggleSort(sort, k));
							s.page = 1;
						}}
					/>
				{:else}
					<th class="text-left px-5 py-3.5"
						><span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.kind === 'offline' ? t('offlineColumn') : col.label}</span></th
					>
				{/if}
			{/each}
			<th class="px-5 py-3.5"></th>
		{/snippet}

		{#if loader.loading && !result}
			{#each { length: PAGE_SIZE } as _, i (i)}
				<tr>
					{#each config.columns as col (col.kind + col.label)}<td class="px-5 py-4"><Skeleton class={SKELETON[col.kind]} /></td>{/each}
					<td class="px-5 py-4"><Skeleton class="h-8 w-16" /></td>
				</tr>
			{/each}
		{:else if result && result.data.length === 0}
			<TableEmpty {colspan} icon={config.icon} title="No {config.singular} found" hint={s.search ? 'Try a different search' : config.emptyHint} />
		{:else if result}
			{#each result.data as item (item.id)}
				<tr class="hover:bg-muted/30 transition-colors group cursor-pointer" class:opacity-60={loader.loading} onclick={(e) => edit(item.id, e)}>
					{#each config.columns as col (col.kind + col.label)}
						<td class="px-5 py-4"><ContentCell kind={col.kind} {item} copyId={config.copyId} onoffline={(v) => setOffline(item, v)} /></td>
					{/each}
					<td class="px-5 py-4"><RowActions onedit={(e) => edit(item.id, e)} ondelete={() => (deleting = item)} /></td>
				</tr>
			{/each}
		{/if}
	</DataTable>

	{#snippet after()}
		<ConfirmDialog open={!!deleting} title="Delete {config.singular}?" busy={deleteBusy} onconfirm={confirmDelete} oncancel={() => (deleting = null)}>
			<strong>{deleting?.title}</strong> will be permanently deleted.
		</ConfirmDialog>
	{/snippet}
</ListPage>
