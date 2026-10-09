<script lang="ts">
	import { page } from '$app/state';
	import ChapterForm from '#lib/admin/books/ChapterForm.svelte';
</script>

<ChapterForm defaultBookId={page.url.searchParams.get('bookId') ?? ''} />
