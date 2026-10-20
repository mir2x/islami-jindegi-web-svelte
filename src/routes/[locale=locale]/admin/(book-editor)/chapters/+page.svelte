<script lang="ts">
	import { page } from '$app/state';
	import { hierarchy } from '#lib/admin/books/hierarchy.svelte.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	const t = useT('BooksAdmin');
	const bookId = $derived(page.url.searchParams.get('bookId') ?? '');

	$effect(() => {
		hierarchy.bookId = bookId;
		hierarchy.currentId = undefined;
		hierarchy.currentType = undefined;
	});
</script>

<div class="p-8 text-center text-muted-foreground">{t('selectChapterPrompt')}</div>
