<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import { cn } from '#lib/utils.ts';
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';

	interface DragItem {
		id: string;
		label: string;
		/** Small outlined tag after the label. */
		badge?: string;
		/** Muted text, e.g. hidden entries. */
		dim?: boolean;
	}

	interface Props {
		items: DragItem[];
		onmove: (from: number, to: number) => void;
	}
	let { items, onmove }: Props = $props();

	let dragging = $state<number | null>(null);
</script>

<ul class="space-y-1.5">
	{#each items as it, i (it.id)}
		<li
			draggable="true"
			ondragstart={() => (dragging = i)}
			ondragend={() => (dragging = null)}
			ondragover={(e) => e.preventDefault()}
			ondrop={(e) => {
				e.preventDefault();
				if (dragging !== null) onmove(dragging, i);
				dragging = null;
			}}
			class={cn('flex items-center gap-2 rounded-lg border bg-background px-3 py-2 transition-colors', dragging === i && 'opacity-40', it.dim && 'text-muted-foreground')}
		>
			<GripVertical class="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
			<span class="w-9 text-xs text-muted-foreground tabular-nums shrink-0">{i + 1}</span>
			<span class="flex-1 text-sm truncate">{it.label}</span>
			{#if it.badge}<Badge>{it.badge}</Badge>{/if}
			<!-- Arrows because HTML5 drag-and-drop does not work on touch devices. -->
			<div class="flex shrink-0">
				<Button variant="ghost" size="icon" class="h-7 w-7" disabled={i === 0} onclick={() => onmove(i, i - 1)} aria-label="Move up"><ChevronUp class="w-4 h-4" /></Button>
				<Button variant="ghost" size="icon" class="h-7 w-7" disabled={i === items.length - 1} onclick={() => onmove(i, i + 1)} aria-label="Move down"
					><ChevronDown class="w-4 h-4" /></Button
				>
			</div>
		</li>
	{/each}
</ul>
