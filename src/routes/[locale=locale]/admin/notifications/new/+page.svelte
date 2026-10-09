<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import NotificationForm from '#lib/admin/notifications/NotificationForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import type { PushNotificationDetail } from '#lib/types.ts';

	// ?from=<id> duplicates an existing notification into a new draft.
	const from = $derived(page.url.searchParams.get('from'));
</script>

{#if from}
	{#key from}
		<LoadItem load={() => api.get<PushNotificationDetail>(`/api/admin/notifications/${from}`)} width="max-w-none">
			{#snippet children(template)}<NotificationForm {template} />{/snippet}
		</LoadItem>
	{/key}
{:else}
	<NotificationForm />
{/if}
