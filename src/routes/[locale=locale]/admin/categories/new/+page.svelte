<script lang="ts">
	import { page } from '$app/state';
	import CategoryForm from '#lib/admin/taxonomy/CategoryForm.svelte';
</script>

<CategoryForm defaultParentId={page.url.searchParams.get('parentId') ?? ''} />
