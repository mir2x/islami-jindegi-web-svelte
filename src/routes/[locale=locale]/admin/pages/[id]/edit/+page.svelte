<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import PageForm from '#lib/admin/pages/PageForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import type { PageDetail } from '#lib/types.ts';
</script>

<LoadItem load={() => api.get<PageDetail>(`/api/pages/${page.params.id}`)} width="max-w-3xl" notFound="Page not found.">
	{#snippet children(item)}<PageForm page={item} />{/snippet}
</LoadItem>
