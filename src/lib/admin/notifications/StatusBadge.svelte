<script lang="ts">
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { NotificationStatus } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';

	let { status }: { status: NotificationStatus } = $props();
	const t = useT('Notifications');
	const STYLES: Record<NotificationStatus, string> = {
		draft: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
		scheduled: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
		sending: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
		sent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
		failed: 'text-destructive bg-destructive/10 border-destructive/20'
	};
</script>

<span class={cn('inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-1 whitespace-nowrap', STYLES[status])}>
	<span class={cn('w-1.5 h-1.5 rounded-full bg-current', status === 'sending' && 'animate-pulse')}></span>
	{t(`status.${status}`)}
</span>
