<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import CloudDownload from '@lucide/svelte/icons/cloud-download';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';

	const t = useT('OfflineSync');
</script>

<div class="p-4 sm:p-8">
	<h1 class="text-4xl font-bold mb-2">Dashboard</h1>
	<p class="text-xl text-muted-foreground">Welcome to the Islami Jindegi admin panel.</p>

	<div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		<a href={localePath('/admin/offline-sync')} class="group flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40">
			<CloudDownload class="w-5 h-5 mt-0.5 shrink-0 text-primary" />
			<div class="min-w-0 flex-1">
				<p class="font-semibold">{t('dashboardCardTitle')}</p>
				<p class="mt-1 text-sm text-muted-foreground">{t('dashboardCardDescription')}</p>
			</div>
			<ChevronRight class="w-4 h-4 mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
		</a>
	</div>
</div>
