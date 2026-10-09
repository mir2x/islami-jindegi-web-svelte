<script lang="ts">
	import type { ModuleUsage } from '#lib/types.ts';
	import Modal from '#lib/components/ui/Modal.svelte';
	import Button from '../ui/Button.svelte';
	import Combobox, { type ComboOption } from '../ui/Combobox.svelte';
	import Field from '../ui/Field.svelte';
	import UsageText from './UsageText.svelte';

	interface Props {
		noun: string;
		/** The entity being merged away; null closes the dialog. */
		subject: string | null;
		options: ComboOption[];
		usage: ModuleUsage[] | null;
		busy: boolean;
		onmerge: (targetId: string) => void;
		oncancel: () => void;
	}
	let { noun, subject, options, usage, busy, onmerge, oncancel }: Props = $props();

	let target = $state('');
	$effect(() => {
		if (subject === null) target = '';
	});
</script>

<!-- Merge is the safe counterpart to delete: content moves instead of being destroyed. -->
<Modal open={subject !== null} title="Merge {noun}" onclose={oncancel}>
	<div class="p-4 space-y-4 text-sm text-muted-foreground overflow-y-auto">
		<p>
			All content and module positions move from <strong>{subject}</strong> to the {noun} you pick, and <strong>{subject}</strong> is then deleted.
			<UsageText {usage} loading="Checking what will move…" some="Moving" none="This {noun} has no content." />
		</p>
		<Field label="Merge into" class="text-foreground">
			<Combobox {options} bind:value={target} placeholder="Choose {noun === 'author' ? 'an' : 'a'} {noun}" searchPlaceholder="Search..." />
		</Field>
	</div>
	<div class="flex justify-end gap-2 border-t border-border bg-muted/50 p-3 rounded-b-2xl">
		<Button variant="outline" onclick={oncancel}>Cancel</Button>
		<Button onclick={() => onmerge(target as string)} disabled={!target || busy}>{busy ? 'Merging...' : 'Merge'}</Button>
	</div>
</Modal>
