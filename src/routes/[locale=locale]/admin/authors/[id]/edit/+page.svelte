<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import AuthorForm from '#lib/admin/taxonomy/AuthorForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import type { Author } from '#lib/types.ts';
</script>

<LoadItem load={() => api.get<Author>(`/api/authors/${page.params.id}`)} width="max-w-5xl" notFound="Author not found.">
	{#snippet children(author)}<AuthorForm {author} />{/snippet}
</LoadItem>
