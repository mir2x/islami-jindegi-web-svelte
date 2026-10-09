<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import OctagonX from '@lucide/svelte/icons/octagon-x';
	import Info from '@lucide/svelte/icons/info';
	import { dismiss, toasts } from '../toast.svelte.ts';
	import { cn } from '#lib/utils.ts';

	const icons = { success: CircleCheck, error: OctagonX, info: Info };
	const tone = { success: 'text-emerald-500', error: 'text-destructive', info: 'text-primary' };
</script>

<div class="fixed top-4 right-4 z-[200] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
	{#each toasts as t (t.id)}
		{@const Icon = icons[t.kind]}
		<button
			type="button"
			onclick={() => dismiss(t.id)}
			class="flex items-start gap-2.5 rounded-lg border border-border bg-popover px-3.5 py-3 text-left text-sm text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
		>
			<Icon class={cn('mt-0.5 size-4 shrink-0', tone[t.kind])} />
			<span class="min-w-0 break-words">{t.message}</span>
		</button>
	{/each}
</div>
