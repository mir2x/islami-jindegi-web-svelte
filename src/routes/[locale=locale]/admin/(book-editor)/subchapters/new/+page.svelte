<script lang="ts">
	import { page } from '$app/state';
	import SubChapterForm from '#lib/admin/books/SubChapterForm.svelte';
	import { hierarchy } from '#lib/admin/books/hierarchy.svelte.ts';

	const bookId = $derived(page.url.searchParams.get('bookId') ?? '');
	const chapterId = $derived(page.url.searchParams.get('chapterId') ?? '');
	const parentId = $derived(page.url.searchParams.get('parentSubChapterId') ?? '');

	$effect(() => {
		hierarchy.bookId = bookId;
		hierarchy.currentId = undefined;
		hierarchy.currentType = undefined;
	});
</script>

{#key `${chapterId}-${parentId}`}<SubChapterForm defaultBookId={bookId} defaultChapterId={chapterId} defaultParentId={parentId} />{/key}
