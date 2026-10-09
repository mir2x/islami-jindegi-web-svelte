<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import SubChapterForm from '#lib/admin/books/SubChapterForm.svelte';
	import HierarchySideList from '#lib/admin/books/HierarchySideList.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import Skeleton from '#lib/admin/ui/Skeleton.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { SubChapterDetail } from '#lib/types.ts';

	const t = useT('SubChapterForm');
	const id = $derived(page.params.id!);
	// The side list outlives the record: it only changes when the book does, so moving between items doesn't reload it.
	let bookId = $state('');
</script>

<div class="flex h-full">
	{#if bookId}
		{#key bookId}<HierarchySideList {bookId} currentId={id} currentType="subchapter" />{/key}
	{:else}
		<div class="hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border w-80 shrink-0 p-4 space-y-4">
			<Skeleton class="h-10 w-full" /><Skeleton class="h-10 w-full" />
		</div>
	{/if}
	<div class="flex-1 overflow-y-auto">
		<LoadItem
			load={async () => {
				const item = await api.get<SubChapterDetail>(`/api/subchapters/${id}/admin`);
				bookId = item.bookId;
				return item;
			}}
			width="max-w-none"
			notFound={t('notFound')}
		>
			{#snippet children(item)}<SubChapterForm subChapter={item} />{/snippet}
		</LoadItem>
	</div>
</div>
