<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import CategoryForm from '#lib/admin/taxonomy/CategoryForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import type { Category } from '#lib/types.ts';
</script>

<LoadItem load={() => api.get<Category>(`/api/categories/${page.params.id}`)} width="max-w-xl" notFound="Category not found.">
	{#snippet children(category)}<CategoryForm {category} />{/snippet}
</LoadItem>
