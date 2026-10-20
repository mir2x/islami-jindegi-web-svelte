<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Search from '@lucide/svelte/icons/search';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import Img from '#lib/components/ui/Img.svelte';
	import Switch from '#lib/components/ui/Switch.svelte';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { authorsForModule, categoriesForModule } from '#lib/modules.ts';
	import type { Book } from '#lib/types.ts';
	import { api } from '../api.ts';
	import { recall, remember } from '../content/list-memory.ts';
	import DataTable from '../list/DataTable.svelte';
	import ListPage from '../list/ListPage.svelte';
	import { PagedLoader } from '../list/loader.svelte.ts';
	import RowActions from '../list/RowActions.svelte';
	import { parseSort, sortParam, toggleSort } from '../list/sort.ts';
	import TableEmpty from '../list/TableEmpty.svelte';
	import { lookups } from '../lookups.svelte.ts';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import { inputCls, inp } from '../ui/classes.ts';
	import Combobox from '../ui/Combobox.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import SortHeader from '../ui/SortHeader.svelte';
	import StatusPill from '../ui/StatusPill.svelte';

	let { tabs }: { tabs: Snippet } = $props();

	const PAGE_SIZE = 10;
	const t = useT('BooksAdmin');
	const tc = useT('Common');
	let s = $state(recall('books', 'position_asc'));
	const loader = new PagedLoader<Book>('/api/books');
	let deleting = $state<Book | null>(null);
	let busy = $state(false);
	let searchText = $state(s.search);
	let timer: ReturnType<typeof setTimeout>;

	const result = $derived(loader.result);
	const sort = $derived(parseSort(s.sort));
	const authorOptions = $derived(authorsForModule(lookups.authors, 'book').map((a) => ({ id: a.id, label: a.name })));
	const categoryOptions = $derived(categoriesForModule(lookups.categories, 'book').map((c) => ({ id: c.id, label: c.title, child: !!c.parentId })));

	const load = () =>
		loader.load({ page: s.page, pageSize: PAGE_SIZE, search: s.search, authorId: s.authorId, categoryId: s.categoryId, offlineAvailable: s.offline || undefined, sort: s.sort });
	onMount(() => void lookups.ensureAll());
	$effect(() => {
		remember('books', { ...s });
		load();
		// A new page replaces the rows in place: start it from the top.
		document.querySelector('main')?.scrollTo({ top: 0 });
	});

	const apply = (patch: Partial<typeof s>) => Object.assign(s, patch, { page: 1 });

	async function setOffline(book: Book, value: boolean) {
		const prev = book.isOfflineAvailable;
		book.isOfflineAvailable = value;
		try {
			await api.patch(`/api/books/${book.id}/offline-availability`, { isOfflineAvailable: value });
		} catch {
			book.isOfflineAvailable = prev;
			toast.error(tc('offlineUpdateFailed'));
		}
	}

	async function remove() {
		if (!deleting) return;
		busy = true;
		try {
			await api.delete(`/api/books/${deleting.id}`);
			toast.success(t('itemDeletedToast', { type: t('typeBook') }));
			deleting = null;
			load();
		} catch {
			toast.error(t('deleteFailedToast'));
		} finally {
			busy = false;
		}
	}
</script>

<ListPage
	title={t('title')}
	total={result?.total ?? null}
	countInTitle
	addHref="/admin/books/new"
	addLabel={t('addBook')}
	page={s.page}
	totalPages={loader.totalPages}
	onpage={(p) => (s.page = p)}
	{tabs}
>
	{#snippet filters()}
		<div class="relative flex-1 min-w-56 max-w-sm">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<input
				placeholder={t('searchBooksPlaceholder')}
				value={searchText}
				oninput={(e) => {
					searchText = e.currentTarget.value;
					clearTimeout(timer);
					timer = setTimeout(() => apply({ search: searchText }), 250);
				}}
				class={inp('pl-9 bg-card')}
			/>
		</div>
		<Combobox
			class="w-48"
			options={authorOptions}
			value={s.authorId}
			onchange={(v) => apply({ authorId: v as string })}
			placeholder={t('allAuthorsOption')}
			searchPlaceholder={t('searchAuthorsPlaceholder')}
			emptyText={t('noAuthorsFound')}
			clearable
			filter
		/>
		<Combobox
			class="w-48"
			options={categoryOptions}
			value={s.categoryId}
			onchange={(v) => apply({ categoryId: v as string })}
			placeholder={t('allCategoriesOption')}
			searchPlaceholder={t('searchCategoriesPlaceholder')}
			emptyText={t('noCategoriesFound')}
			clearable
			filter
		/>
		<label class="flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground">
			<Switch checked={s.offline} label={tc('offlineFilterLabel')} onchange={(v) => apply({ offline: v })} />
			{tc('offlineFilterLabel')}
		</label>
	{/snippet}

	<DataTable widths={['w-32', '', 'w-56', 'w-36', 'w-36', 'w-24', 'w-28']} minWidth="min-w-[1040px]">
		{#snippet head()}
			{@const onsort = (k: string) => {
				s.sort = sortParam(toggleSort(sort, k));
				s.page = 1;
			}}
			<SortHeader label={t('colPosition')} sortKey="position" {sort} {onsort} />
			<SortHeader label={t('colBook')} sortKey="title" {sort} {onsort} />
			<SortHeader label={t('colAuthors')} sortKey="authors" {sort} {onsort} />
			<SortHeader label={t('colUpdatedAt')} sortKey="updated" {sort} {onsort} />
			<SortHeader label={t('colStatus')} sortKey="published" {sort} {onsort} />
			<th class="text-left px-5 py-3.5"><span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tc('offlineColumn')}</span></th>
			<th class="px-5 py-3.5"></th>
		{/snippet}

		{#if loader.loading && !result}
			{#each { length: PAGE_SIZE } as _, i (i)}
				<tr>
					<td class="px-5 py-4"><Skeleton class="h-3.5 w-6" /></td>
					<td class="px-5 py-4"
						><div class="flex items-center gap-3">
							<Skeleton class="w-10 h-14 rounded-lg shrink-0" />
							<div class="space-y-2"><Skeleton class="h-4 w-44" /><Skeleton class="h-3 w-32" /></div>
						</div></td
					>
					<td class="px-5 py-4"><Skeleton class="h-3.5 w-28" /></td><td class="px-5 py-4"><Skeleton class="h-3.5 w-20" /></td>
					<td class="px-5 py-4"><Skeleton class="h-5 w-20 rounded-full" /></td><td class="px-5 py-4"><Skeleton class="h-5 w-9 rounded-full" /></td><td class="px-5 py-4"
						><Skeleton class="h-8 w-16 rounded-lg" /></td
					>
				</tr>
			{/each}
		{:else if result && result.data.length === 0}
			<TableEmpty colspan={7} icon="book" title={t('emptyBooksTitle')} hint={t('emptyBooksSubtitle')} />
		{:else if result}
			{#each result.data as book (book.id)}
				<tr class="hover:bg-muted/30 transition-colors group cursor-pointer" class:opacity-60={loader.loading} onclick={(e) => adminNavigate(`/admin/books/${book.id}`, e)}>
					<td class="px-5 py-4"><span class="text-sm font-mono text-muted-foreground">{book.position}</span></td>
					<td class="px-5 py-4">
						<div class="flex items-center gap-3">
							<img src={book.coverUrl || '/images/default-book-360.webp'} alt="" loading="lazy" class="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0 border bg-muted" />
							<div class="min-w-0">
								<p class="font-semibold text-foreground leading-snug truncate">{book.title}</p>
								{#if book.excerpt}<p class="text-sm text-muted-foreground line-clamp-1 mt-0.5">{book.excerpt}</p>{/if}
							</div>
						</div>
					</td>
					<td class="px-5 py-4"><p class="text-sm text-muted-foreground line-clamp-2">{book.authors.length ? book.authors.map((a) => a.name).join(', ') : '—'}</p></td>
					<td class="px-5 py-4"><span class="text-sm text-muted-foreground whitespace-nowrap">{new Date(book.updatedAt).toLocaleDateString()}</span></td>
					<td class="px-5 py-4"><StatusPill published={book.published} labels={{ published: t('published'), draft: t('draft') }} /></td>
					<td class="px-5 py-4">
						<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
						<div onclick={(e) => e.stopPropagation()}><Switch checked={book.isOfflineAvailable} label="Available offline" onchange={(v) => setOffline(book, v)} /></div>
					</td>
					<td class="px-5 py-4"><RowActions publicHref="/books/{book.id}" onedit={(e) => adminNavigate(`/admin/books/${book.id}/edit`, e)} ondelete={() => (deleting = book)} /></td>
				</tr>
			{/each}
		{/if}
	</DataTable>

	{#snippet after()}
		<ConfirmDialog
			open={!!deleting}
			title={t('deleteTitle', { type: t('typeBook') })}
			{busy}
			confirmLabel={tc('delete')}
			busyLabel={t('deleting')}
			onconfirm={remove}
			oncancel={() => (deleting = null)}
		>
			<strong>{deleting?.title}</strong> will be permanently deleted. This action cannot be undone.
		</ConfirmDialog>
	{/snippet}
</ListPage>
