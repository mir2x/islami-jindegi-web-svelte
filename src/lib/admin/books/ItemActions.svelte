<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import { adminNavigate } from '../navigate.ts';

	interface Props {
		editHref: string;
		publicHref: string;
		editTitle: string;
		deleteTitle: string;
		ondelete: () => void;
		/** Icon size class, e.g. "w-3.5 h-3.5". */
		icon?: string;
	}
	let { editHref, publicHref, editTitle, deleteTitle, ondelete, icon = 'w-3 h-3' }: Props = $props();

	const btn = 'p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground';
</script>

<div class="shrink-0 flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
	<button type="button" onclick={(e) => adminNavigate(editHref, e)} class={btn} title={editTitle} aria-label={editTitle}><Pencil class={icon} /></button>
	<a href={localePath(publicHref)} target="_blank" rel="noopener noreferrer" class={btn} title="Public View" aria-label="Public View"><ExternalLink class={icon} /></a>
	<button type="button" onclick={ondelete} class="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title={deleteTitle} aria-label={deleteTitle}
		><Trash2 class={icon} /></button
	>
</div>
