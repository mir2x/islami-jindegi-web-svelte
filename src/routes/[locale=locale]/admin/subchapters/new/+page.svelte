<script lang="ts">
	import { page } from '$app/state';
	import SubChapterForm from '#lib/admin/books/SubChapterForm.svelte';
</script>

<SubChapterForm defaultBookId={page.url.searchParams.get('bookId') ?? ''} />
