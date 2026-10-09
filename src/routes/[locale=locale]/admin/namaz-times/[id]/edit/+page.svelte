<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import NamazTimeForm from '#lib/admin/pages/NamazTimeForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import type { NamazTimeDetail } from '#lib/types.ts';
</script>

<LoadItem load={() => api.get<NamazTimeDetail>(`/api/namaz-times/${page.params.id}`)} width="max-w-3xl" notFound="Not found.">
	{#snippet children(item)}<NamazTimeForm {item} />{/snippet}
</LoadItem>
