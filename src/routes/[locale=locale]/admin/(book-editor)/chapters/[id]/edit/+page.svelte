<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import ChapterForm from '#lib/admin/books/ChapterForm.svelte';
	import { hierarchy } from '#lib/admin/books/hierarchy.svelte.ts';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ChapterDetail } from '#lib/types.ts';

	const t = useT('ChapterForm');
	const id = $derived(page.params.id!);

	$effect(() => {
		hierarchy.currentId = id;
		hierarchy.currentType = 'chapter';
	});
</script>

<LoadItem
	load={async () => {
		const item = await api.get<ChapterDetail>(`/api/chapters/${id}/admin`);
		hierarchy.bookId = item.bookId;
		return item;
	}}
	width="max-w-none"
	notFound={t('notFound')}
>
	{#snippet children(item)}<ChapterForm chapter={item} />{/snippet}
</LoadItem>
