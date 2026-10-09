<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import BookForm from '#lib/admin/books/BookForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BookDetail } from '#lib/types.ts';

	const t = useT('BookForm');
</script>

<LoadItem load={() => api.get<BookDetail>(`/api/books/${page.params.id}/admin`)} width="max-w-3xl" notFound={t('notFound')}>
	{#snippet children(book)}<BookForm {book} />{/snippet}
</LoadItem>
