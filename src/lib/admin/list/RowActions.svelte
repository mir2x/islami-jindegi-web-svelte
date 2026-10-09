<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '../ui/Button.svelte';

	/** Edit / delete buttons of a table row; shown on hover on desktop. */
	let { onedit, ondelete }: { onedit: (e: MouseEvent) => void; ondelete?: () => void } = $props();
</script>

<div class="flex items-center gap-1 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
	<Button
		variant="ghost"
		size="icon"
		aria-label="Edit"
		onclick={(e) => {
			e.stopPropagation();
			onedit(e);
		}}
		class="h-8 w-8 text-muted-foreground hover:text-foreground"><Pencil class="w-3.5 h-3.5" /></Button
	>
	{#if ondelete}<Button
			variant="ghost"
			size="icon"
			aria-label="Delete"
			onclick={(e) => {
				e.stopPropagation();
				ondelete();
			}}
			class="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 class="w-3.5 h-3.5" /></Button
		>{/if}
</div>
