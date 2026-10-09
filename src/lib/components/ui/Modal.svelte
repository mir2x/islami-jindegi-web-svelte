<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import { cn } from '#lib/utils.ts';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		/** Extra classes for the panel (e.g. a different max width). */
		class?: string;
		children: Snippet;
	}
	let { open, title, onclose, class: className, children }: Props = $props();
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && onclose()} />

{#if open}
	<div class="fixed inset-0 z-[100]">
		<button type="button" tabindex="-1" aria-label="Close" class="absolute inset-0 bg-black/40 cursor-default" onclick={onclose}></button>
		<!-- Centred with auto margins, not translate: the zoom-in animation drives `transform`. -->
		<div
			role="dialog"
			aria-modal="true"
			aria-label={title}
			class={cn(
				'absolute top-20 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-sm max-h-[75vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150',
				className
			)}
		>
			<div class="flex items-center justify-between px-4 pt-4 pb-3 shrink-0 border-b border-border/60">
				<h3 class="text-sm font-semibold text-foreground">{title}</h3>
				<button type="button" onclick={onclose} aria-label="Close" class="p-1 -m-1 text-muted-foreground hover:text-foreground"><X class="w-4.5 h-4.5" /></button>
			</div>
			{@render children()}
		</div>
	</div>
{/if}
