<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import HijriForm from '#lib/admin/hijri/HijriForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import type { HijriMonthSighting } from '#lib/types.ts';
</script>

<LoadItem load={() => api.get<HijriMonthSighting>(`/api/hijri/sightings/${page.params.id}`)} width="max-w-3xl" notFound="Not found.">
	{#snippet children(item)}<HijriForm {item} />{/snippet}
</LoadItem>
