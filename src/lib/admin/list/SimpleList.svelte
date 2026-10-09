<script lang="ts" generics="T extends { id: string; isOfflineAvailable?: boolean }">
	import Search from '@lucide/svelte/icons/search';
	import type { Snippet } from 'svelte';
	import Switch from '#lib/components/ui/Switch.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { api } from '../api.ts';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import { inputCls, inp } from '../ui/classes.ts';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import type { EmptyIconName } from '../ui/icons.ts';
	import Skeleton from '../ui/Skeleton.svelte';
	import DataTable from './DataTable.svelte';
	import ListPage from './ListPage.svelte';
	import { PagedLoader } from './loader.svelte.ts';
	import RowActions from './RowActions.svelte';
	import TableEmpty from './TableEmpty.svelte';

	interface Column {
		label: string;
		/** Tailwind width class; '' = flexible. */
		width?: string;
		cell: Snippet<[T]>;
		/** Skeleton block shown while loading, e.g. "h-4 w-40". */
		skeleton?: string;
	}

	interface Props {
		title: string;
		/** Word after the count in the header. */
		unit: string;
		/** "page" → "Delete page?" and "No pages found" is built from `plural`. */
		singular: string;
		plural: string;
		/** API collection path, e.g. `/api/pages`. */
		apiPath: string;
		/** Admin route segment: `/admin/<slug>`. */
		slug: string;
		addLabel: string;
		icon: EmptyIconName;
		emptyHint: string;
		columns: Column[];
		minWidth?: string;
		/** Adds the offline filter switch and column. */
		offline?: boolean;
		/** Shows a search box with this placeholder. */
		searchPlaceholder?: string;
		/** The record's display name for the delete dialog. */
		nameOf: (item: T) => string;
		/** Sentence after the name in the delete dialog. */
		deleteNote?: string;
		deleteSuccess?: string;
		/** Extra query params (reactive); changing them reloads from the current page. */
		params?: Record<string, string | number | undefined>;
		/** Extra filter controls, rendered after the search box. */
		filters?: Snippet;
		/** The empty-state hint when filters are active. */
		filteredHint?: string;
		page?: number;
		/** Clicking a row opens the editor. */
		clickable?: boolean;
	}

	let {
		title,
		unit,
		singular,
		plural,
		apiPath,
		slug,
		addLabel,
		icon,
		emptyHint,
		columns,
		minWidth = 'min-w-[660px]',
		offline = false,
		searchPlaceholder,
		nameOf,
		deleteNote = 'will be permanently deleted.',
		deleteSuccess = 'Deleted',
		params = {},
		filters,
		filteredHint = 'Try a different search',
		page = $bindable(1),
		clickable = true
	}: Props = $props();

	const PAGE_SIZE = 20;
	const t = useT('Common');
	// svelte-ignore state_referenced_locally
	const loader = new PagedLoader<T>(apiPath);
	let search = $state('');
	let offlineOnly = $state(false);
	let deleting = $state<T | null>(null);
	let busy = $state(false);

	const result = $derived(loader.result);
	const cols = $derived(offline ? [...columns, { label: t('offlineColumn'), width: 'w-24', skeleton: 'h-5 w-9 rounded-full' } as Column] : columns);
	const load = () => loader.load({ page, pageSize: PAGE_SIZE, search, offlineAvailable: offlineOnly || undefined, ...params });
	$effect(() => void load());

	async function setOffline(item: T, value: boolean) {
		const prev = item.isOfflineAvailable;
		item.isOfflineAvailable = value;
		try {
			await api.patch(`${apiPath}/${item.id}/offline-availability`, { isOfflineAvailable: value });
		} catch {
			item.isOfflineAvailable = prev;
			toast.error(t('offlineUpdateFailed'));
		}
	}

	async function confirmDelete() {
		if (!deleting) return;
		busy = true;
		try {
			await api.delete(`${apiPath}/${deleting.id}`);
			toast.success(deleteSuccess);
			deleting = null;
			load();
		} catch {
			toast.error('Failed to delete');
		} finally {
			busy = false;
		}
	}

	const edit = (id: string, e?: { ctrlKey: boolean; metaKey: boolean }) => adminNavigate(`/admin/${slug}/${id}/edit`, e);
</script>

{#snippet bar()}
	{#if searchPlaceholder}
		<div class="relative flex-1 min-w-56 max-w-sm">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<input
				placeholder={searchPlaceholder}
				value={search}
				oninput={(e) => {
					search = e.currentTarget.value;
					page = 1;
				}}
				class={inp('pl-9 bg-card')}
			/>
		</div>
	{/if}
	{@render filters?.()}
	{#if offline}
		<label class="flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground">
			<Switch
				checked={offlineOnly}
				label={t('offlineFilterLabel')}
				onchange={(v) => {
					offlineOnly = v;
					page = 1;
				}}
			/>
			{t('offlineFilterLabel')}
		</label>
	{/if}
{/snippet}

<ListPage filters={bar} {title} total={result?.total ?? null} {unit} addHref="/admin/{slug}/new" {addLabel} {page} totalPages={loader.totalPages} onpage={(p) => (page = p)}>
	<DataTable fixed={false} widths={[...cols.map((c) => c.width ?? ''), 'w-24']} {minWidth}>
		{#snippet head()}
			{#each cols as c (c.label)}<th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</th>{/each}
			<th class="px-5 py-3.5"></th>
		{/snippet}

		{#if loader.loading && !result}
			{#each { length: 8 } as _, i (i)}
				<tr>
					{#each cols as c (c.label)}<td class="px-5 py-4"><Skeleton class={c.skeleton ?? 'h-4 w-32'} /></td>{/each}
					<td class="px-5 py-4"></td>
				</tr>
			{/each}
		{:else if result && result.data.length === 0}
			<TableEmpty colspan={cols.length + 1} {icon} title="No {plural} found" hint={search || Object.values(params).some(Boolean) ? filteredHint : emptyHint} />
		{:else if result}
			{#each result.data as item (item.id)}
				<tr
					class="hover:bg-muted/30 transition-colors group {clickable ? 'cursor-pointer' : ''}"
					class:opacity-60={loader.loading}
					onclick={clickable ? (e) => edit(item.id, e) : undefined}
				>
					{#each columns as c (c.label)}<td class="px-5 py-4">{@render c.cell(item)}</td>{/each}
					{#if offline}
						<td class="px-5 py-4">
							<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
							<div onclick={(e) => e.stopPropagation()}><Switch checked={!!item.isOfflineAvailable} label="Available offline" onchange={(v) => setOffline(item, v)} /></div>
						</td>
					{/if}
					<td class="px-5 py-4"><RowActions onedit={(e) => edit(item.id, e)} ondelete={() => (deleting = item)} /></td>
				</tr>
			{/each}
		{/if}
	</DataTable>

	{#snippet after()}
		<ConfirmDialog open={!!deleting} title="Delete {singular}?" {busy} onconfirm={confirmDelete} oncancel={() => (deleting = null)}>
			<strong>{deleting ? nameOf(deleting) : ''}</strong>
			{deleteNote}
		</ConfirmDialog>
	{/snippet}
</ListPage>
