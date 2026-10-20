<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import SubChapterForm from '#lib/admin/books/SubChapterForm.svelte';
	import { hierarchy } from '#lib/admin/books/hierarchy.svelte.ts';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { SubChapterDetail } from '#lib/types.ts';

	const t = useT('SubChapterForm');
	const id = $derived(page.params.id!);

	$effect(() => {
		hierarchy.currentId = id;
		hierarchy.currentType = 'subchapter';
	});
</script>

<LoadItem
	load={async () => {
		const item = await api.get<SubChapterDetail>(`/api/subchapters/${id}/admin`);
		hierarchy.bookId = item.bookId;
		return item;
	}}
	width="max-w-none"
	notFound={t('notFound')}
>
	{#snippet children(item)}<SubChapterForm subChapter={item} />{/snippet}
</LoadItem>
