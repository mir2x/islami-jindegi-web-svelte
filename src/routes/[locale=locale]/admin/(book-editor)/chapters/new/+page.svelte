<script lang="ts">
	import { page } from '$app/state';
	import ChapterForm from '#lib/admin/books/ChapterForm.svelte';
	import { hierarchy } from '#lib/admin/books/hierarchy.svelte.ts';

	const bookId = $derived(page.url.searchParams.get('bookId') ?? '');

	$effect(() => {
		hierarchy.bookId = bookId;
		hierarchy.currentId = undefined;
		hierarchy.currentType = undefined;
	});
</script>

<ChapterForm defaultBookId={bookId} />
