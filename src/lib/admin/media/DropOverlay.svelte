<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';

	let { show, hint }: { show: boolean; hint?: string } = $props();
</script>

{#if show}
	<!-- pointer-events-none so the overlay itself never fires dragleave on the zone. -->
	<div
		class="pointer-events-none absolute inset-0 z-40 m-3 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-background/85 backdrop-blur-sm"
	>
		<Upload class="w-10 h-10 text-primary" />
		<p class="text-base font-semibold">Drop files to upload</p>
		{#if hint}<p class="text-sm text-muted-foreground">{hint}</p>{/if}
	</div>
{/if}
