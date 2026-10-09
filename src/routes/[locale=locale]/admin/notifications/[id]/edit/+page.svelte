<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import NotificationForm from '#lib/admin/notifications/NotificationForm.svelte';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { PushNotificationDetail } from '#lib/types.ts';

	const t = useT('Notifications');
</script>

<LoadItem load={() => api.get<PushNotificationDetail>(`/api/admin/notifications/${page.params.id}`)} width="max-w-none" notFound={t('notFound')}>
	{#snippet children(notification)}<NotificationForm {notification} />{/snippet}
</LoadItem>
