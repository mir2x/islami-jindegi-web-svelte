<script lang="ts">
	import CheckCircle2 from '@lucide/svelte/icons/circle-check';
	import Clock from '@lucide/svelte/icons/clock';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import X from '@lucide/svelte/icons/x';
	import XCircle from '@lucide/svelte/icons/circle-x';
	import { cn } from '#lib/utils.ts';
	import { formatBytes } from './files.ts';
	import type { UploadQueue } from './upload-queue.svelte.ts';

	let { queue, class: className }: { queue: UploadQueue; class?: string } = $props();

	const active = $derived(queue.active);
	const done = $derived(queue.jobs.filter((j) => j.status === 'done').length);
	const failed = $derived(queue.jobs.filter((j) => j.status === 'error').length);
</script>

{#if queue.jobs.length > 0}
	<div class={cn('fixed bottom-5 right-5 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50', className)}>
		<div class="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
			<div class="flex items-center gap-2">
				{#if active > 0}<Loader2 class="w-3.5 h-3.5 animate-spin text-primary shrink-0" />{/if}
				<span class="text-sm font-semibold">
					{#if active > 0}Uploading {active} file{active !== 1 ? 's' : ''}…{:else if failed > 0}{done} uploaded, {failed} failed{:else}{done} file{done !== 1 ? 's' : ''} uploaded{/if}
				</span>
			</div>
			{#if active === 0}<button type="button" aria-label="Dismiss" onclick={queue.clear} class="text-muted-foreground hover:text-foreground transition-colors"
					><X class="w-4 h-4" /></button
				>{/if}
		</div>
		<div class="max-h-60 overflow-y-auto divide-y divide-border/50">
			{#each queue.jobs as job (job.id)}
				<div class="px-4 py-3">
					<div class="flex items-center gap-2 mb-1.5">
						{#if job.status === 'queued'}<Clock class="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
						{:else if job.status === 'uploading'}<Loader2 class="w-3.5 h-3.5 shrink-0 animate-spin text-primary" />
						{:else if job.status === 'done'}<CheckCircle2 class="w-3.5 h-3.5 shrink-0 text-green-500" />
						{:else}<XCircle class="w-3.5 h-3.5 shrink-0 text-destructive" />{/if}
						<span class="text-xs font-medium truncate flex-1 min-w-0">{job.name}</span>
						<span class="text-xs text-muted-foreground shrink-0 tabular-nums"
							>{job.status === 'uploading' ? `${job.progress}%` : job.status === 'queued' ? 'Waiting' : formatBytes(job.size)}</span
						>
					</div>
					{#if job.status === 'uploading'}
						<div class="h-1 rounded-full bg-muted overflow-hidden">
							<div class="h-full bg-primary rounded-full transition-[width] duration-150" style:width="{job.progress}%"></div>
						</div>
					{/if}
					{#if job.status === 'error'}<p class="text-[11px] text-destructive mt-0.5 leading-snug">{job.error}</p>{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
