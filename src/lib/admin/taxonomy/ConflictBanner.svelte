<script lang="ts">
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import Merge from '@lucide/svelte/icons/merge';
	import Button from '../ui/Button.svelte';

	interface Props {
		heading: string;
		message: string;
		/** The existing record the new name collided with, when it can be merged into. */
		mergeInto: string | null;
		busy: boolean;
		onmerge: () => void;
	}
	let { heading, message, mergeInto, busy, onmerge }: Props = $props();
</script>

<div class="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3">
	<div class="flex gap-2.5">
		<AlertTriangle class="w-4 h-4 text-destructive shrink-0 mt-0.5" />
		<div class="text-sm">
			<p class="font-medium text-destructive">{heading}</p>
			<p class="text-muted-foreground mt-1">{message}</p>
		</div>
	</div>
	{#if mergeInto}<Button variant="outline" size="sm" onclick={onmerge} disabled={busy}><Merge class="w-4 h-4" /> Merge into "{mergeInto}"</Button>{/if}
</div>
