<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import MadrasahForm from '#lib/admin/madrasah/MadrasahForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import type { MadrasahDetail } from '#lib/types.ts';
</script>

<LoadItem load={() => api.get<MadrasahDetail>(`/api/madrasahs/${page.params.id}`)} width="max-w-4xl" notFound="Not found.">
	{#snippet children(item)}<MadrasahForm {item} />{/snippet}
</LoadItem>
