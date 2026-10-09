<script lang="ts" generics="B">
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import Overlay from '#lib/components/ui/Overlay.svelte';

	interface Props {
		onclose: () => void;
		title: string;
		empty: string;
		removeLabel: string;
		/** Newest first. */
		items: B[];
		itemKey: (b: B) => string;
		onpick: (b: B) => void;
		onremove: (b: B) => void;
		/** The text of one bookmark. */
		row: Snippet<[b: B]>;
	}
	let { onclose, title, empty, removeLabel, items, itemKey, onpick, onremove, row }: Props = $props();
</script>

<Overlay {onclose} label={title} class="w-full sm:max-w-lg sm:mx-4 max-h-[85vh] rounded-t-2xl sm:rounded-2xl">
	<div class="shrink-0 flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border">
		<div class="flex items-center gap-2">
			<Bookmark class="w-4 h-4 text-primary" />
			<p class="text-sm font-bold text-foreground">{title}</p>
		</div>
		<button
			type="button"
			onclick={onclose}
			aria-label="Close"
			class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
			><X class="w-4 h-4" /></button
		>
	</div>
	<div class="flex-1 overflow-y-auto">
		{#if items.length === 0}<p class="text-center text-sm text-muted-foreground py-16">{empty}</p>{/if}
		{#each items as b (itemKey(b))}
			<div class="flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
				<button type="button" onclick={() => onpick(b)} class="flex-1 min-w-0 text-left">{@render row(b)}</button>
				<button
					type="button"
					onclick={() => onremove(b)}
					title={removeLabel}
					aria-label={removeLabel}
					class="shrink-0 mt-1 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 class="w-3.5 h-3.5" /></button
				>
			</div>
		{/each}
	</div>
</Overlay>
