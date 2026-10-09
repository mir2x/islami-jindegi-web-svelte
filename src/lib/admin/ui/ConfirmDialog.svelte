<script lang="ts">
	import type { Snippet } from 'svelte';
	import Modal from '#lib/components/ui/Modal.svelte';
	import Button from './Button.svelte';

	interface Props {
		open: boolean;
		title: string;
		busy?: boolean;
		confirmLabel?: string;
		busyLabel?: string;
		/** Primary (not red) confirm button. */
		primary?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
		children: Snippet;
	}
	let { open, title, busy = false, confirmLabel = 'Delete', busyLabel = 'Deleting...', primary = false, onconfirm, oncancel, children }: Props = $props();
</script>

<Modal {open} {title} onclose={oncancel}>
	<div class="p-4 text-sm text-muted-foreground">{@render children()}</div>
	<div class="flex justify-end gap-2 border-t border-border bg-muted/50 p-3 rounded-b-2xl">
		<Button variant="outline" onclick={oncancel}>Cancel</Button>
		<Button variant={primary ? 'default' : 'destructive'} onclick={onconfirm} disabled={busy}>{busy ? busyLabel : confirmLabel}</Button>
	</div>
</Modal>
