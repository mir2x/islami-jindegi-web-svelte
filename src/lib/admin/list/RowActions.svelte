<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import Button from '../ui/Button.svelte';

	/** Edit / public view / delete buttons of a table row; shown on hover on desktop. */
	let { onedit, ondelete, publicHref }: { onedit: (e: MouseEvent) => void; ondelete?: () => void; publicHref?: string } = $props();
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
	{#if publicHref}<Button
			variant="ghost"
			size="icon"
			href={localePath(publicHref)}
			target="_blank"
			rel="noopener noreferrer"
			title="Public View"
			aria-label="Public View"
			onclick={(e) => e.stopPropagation()}
			class="h-8 w-8 text-muted-foreground hover:text-foreground"><ExternalLink class="w-3.5 h-3.5" /></Button
		>{/if}
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
