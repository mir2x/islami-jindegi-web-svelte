<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ChapterListItem, SubChapterListItem } from '#lib/types.ts';
	import { api } from '../api.ts';
	import DataTable from '../list/DataTable.svelte';
	import ListPage from '../list/ListPage.svelte';
	import { PagedLoader } from '../list/loader.svelte.ts';
	import RowActions from '../list/RowActions.svelte';
	import { parseSort, sortParam, toggleSort } from '../list/sort.ts';
	import { lookups } from '../lookups.svelte.ts';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import { inputCls, inp } from '../ui/classes.ts';
	import Combobox from '../ui/Combobox.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import SortHeader from '../ui/SortHeader.svelte';

	type Row = ChapterListItem | SubChapterListItem;
	let { kind, tabs }: { kind: 'chapters' | 'subchapters'; tabs: Snippet } = $props();

	const PAGE_SIZE = 20;
	const publicHref = (row: Row) => ('chapterId' in row ? `/books/${row.bookId}?chapter=${row.chapterId}&sub=${row.id}` : `/books/${row.bookId}?chapter=${row.id}`);
	const t = useT('BooksAdmin');
	const tc = useT('Common');
	// A tab is mounted per kind (BooksPage keys on it), so these seed once.
	// svelte-ignore state_referenced_locally
	const isChapters = kind === 'chapters';
	// svelte-ignore state_referenced_locally
	const loader = new PagedLoader<Row>(`/api/${kind}`);
	// Column layout per kind: [label, sort key, width, cell text].
	const cols = isChapters
		? [
				{ label: t('colPosition'), key: 'position', width: 'w-32', text: (r: Row) => String(r.position), mono: true },
				{ label: t('colChapter'), key: 'title', width: '', text: (r: Row) => r.title, bold: true },
				{ label: t('colBook'), key: 'book', width: 'w-72', text: (r: Row) => r.bookTitle },
				{ label: t('colSubs'), key: 'subs', width: 'w-28', text: (r: Row) => String((r as ChapterListItem).subChapterCount || '—') }
			]
		: [
				{ label: t('colPosition'), key: 'position', width: 'w-32', text: (r: Row) => String(r.position), mono: true },
				{ label: t('colSubchapter'), key: 'title', width: '', text: (r: Row) => r.title, bold: true },
				{ label: t('colChapter'), key: 'chapter', width: 'w-64', text: (r: Row) => (r as SubChapterListItem).chapterTitle },
				{ label: t('colBook'), key: 'book', width: 'w-64', text: (r: Row) => r.bookTitle }
			];

	let search = $state('');
	let bookId = $state('');
	let page = $state(1);
	let sort = $state(parseSort('position_asc'));
	let deleting = $state<Row | null>(null);
	let busy = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	const result = $derived(loader.result);
	const bookOptions = $derived(lookups.books.map((b) => ({ id: b.id, label: b.title })));
	const load = () => loader.load({ page, pageSize: PAGE_SIZE, search, bookId, sort: sortParam(sort) });

	onMount(() => void lookups.ensureBooks());
	$effect(() => {
		load();
		document.querySelector('main')?.scrollTo({ top: 0 });
	});

	async function remove() {
		if (!deleting) return;
		busy = true;
		try {
			await api.delete(`/api/${kind}/${deleting.id}`);
			toast.success(t('itemDeletedToast', { type: isChapters ? t('typeChapter') : t('typeSubchapter') }));
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
	addHref="/admin/{kind}/new"
	addLabel={isChapters ? t('addChapter') : t('addSubchapter')}
	{page}
	totalPages={loader.totalPages}
	onpage={(p) => (page = p)}
	{tabs}
>
	{#snippet filters()}
		<div class="relative flex-1 min-w-56 max-w-sm">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<input
				placeholder={isChapters ? t('searchChaptersPlaceholder') : t('searchSubchaptersPlaceholder')}
				oninput={(e) => {
					const v = e.currentTarget.value;
					clearTimeout(timer);
					timer = setTimeout(() => ((search = v), (page = 1)), 250);
				}}
				class={inp('pl-9 bg-card')}
			/>
		</div>
		<Combobox
			class="w-56"
			options={bookOptions}
			bind:value={bookId}
			onchange={() => (page = 1)}
			placeholder={t('allBooksOption')}
			searchPlaceholder={t('searchBooksFilterPlaceholder')}
			emptyText={t('noBooksFoundOption')}
			clearable
			filter
		/>
	{/snippet}

	<DataTable widths={[...cols.map((c) => c.width), 'w-28']} minWidth={isChapters ? 'min-w-[840px]' : 'min-w-[960px]'}>
		{#snippet head()}
			{#each cols as c (c.key)}<SortHeader
					label={c.label}
					sortKey={c.key}
					{sort}
					onsort={(k) => {
						sort = toggleSort(sort, k);
						page = 1;
					}}
				/>{/each}
			<th class="px-5 py-3.5"></th>
		{/snippet}

		{#if loader.loading && !result}
			{#each { length: PAGE_SIZE } as _, i (i)}
				<tr
					>{#each cols as c (c.key)}<td class="px-5 py-4"><Skeleton class="h-4 w-32" /></td>{/each}<td class="px-5 py-4"><Skeleton class="h-8 w-16" /></td></tr
				>
			{/each}
		{:else if result && result.data.length === 0}
			<tr><td colspan={cols.length + 1} class="px-5 py-20 text-center"><p class="font-medium">{isChapters ? t('emptyChaptersTitle') : t('emptySubchaptersTitle')}</p></td></tr>
		{:else if result}
			{#each result.data as row (row.id)}
				<tr class="hover:bg-muted/30 transition-colors group" class:opacity-60={loader.loading}>
					{#each cols as c (c.key)}
						<td class="px-5 py-4"
							><p class="truncate {c.mono ? 'text-sm font-mono text-muted-foreground' : c.bold ? 'font-semibold' : 'text-sm text-muted-foreground'}">{c.text(row)}</p></td
						>
					{/each}
					<td class="px-5 py-4"><RowActions publicHref={publicHref(row)} onedit={(e) => adminNavigate(`/admin/${kind}/${row.id}/edit`, e)} ondelete={() => (deleting = row)} /></td>
				</tr>
			{/each}
		{/if}
	</DataTable>

	{#snippet after()}
		<ConfirmDialog
			open={!!deleting}
			title={t('deleteTitle', { type: isChapters ? t('typeChapter') : t('typeSubchapter') })}
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
