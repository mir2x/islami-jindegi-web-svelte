<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ModuleUsage } from '#lib/types.ts';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import UsageText from './UsageText.svelte';

	interface Props {
		noun: string;
		/** The entity's name; null closes the dialog. */
		subject: string | null;
		usage: ModuleUsage[] | null;
		busy: boolean;
		/** Disable the button while content is attached (the API refuses the delete anyway). */
		blockOnUsage?: boolean;
		/** Text after "will be permanently deleted". */
		consequence: string;
		/** The sentence shown while counts load / when there is content / when there is none. */
		texts: { loading: string; some: string; after?: string; none: string };
		extra?: Snippet;
		onconfirm: () => void;
		oncancel: () => void;
	}
	let { noun, subject, usage, busy, blockOnUsage = false, consequence, texts, extra, onconfirm, oncancel }: Props = $props();
</script>

<ConfirmDialog open={subject !== null} title="Delete {noun}?" {busy} onconfirm={() => !(blockOnUsage && (usage === null || usage.length > 0)) && onconfirm()} {oncancel}>
	<strong>{subject}</strong> will be permanently deleted, {consequence}.
	{@render extra?.()}
	<UsageText {usage} loading={texts.loading} some={texts.some} after={texts.after} none={texts.none} warn />
</ConfirmDialog>
