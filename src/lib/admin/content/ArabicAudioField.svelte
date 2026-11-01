<script lang="ts">
	import MediaField from '../media/MediaField.svelte';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import { arabicBlocks, parseEntries, serializeEntries, stateOf, withEntry } from './arabic-audio.ts';

	interface Props {
		/** The JSON stored with the dua. */
		value: string;
		/** The dua body the blocks are found in. */
		body: string;
	}
	let { value = $bindable(), body }: Props = $props();

	const blocks = $derived(arabicBlocks(body ?? ''));
	const entries = $derived(parseEntries(value));
	const entryOf = (n: number) => entries.find((e) => e.n === n);

	const set = (block: (typeof blocks)[number], url: string) => (value = serializeEntries(withEntry(entries, block, url)));
	// Audio for blocks that no longer exist (the body lost some) is dropped on the next change, but shown until then.
	const orphans = $derived(entries.filter((e) => e.n > blocks.length));
</script>

{#if blocks.length === 0}
	<p class="text-sm text-muted-foreground">No Arabic text found. Paragraphs written in Arabic, or marked right-to-left (RTL), appear here ready for a recitation.</p>
{:else}
	<div class="space-y-3">
		{#each blocks as block (block.number)}
			{@const entry = entryOf(block.number)}
			{@const state = stateOf(block, entry)}
			<div class="rounded-xl border p-3 space-y-2">
				<div class="flex items-start gap-3">
					<span class="text-sm font-semibold text-muted-foreground w-6 shrink-0">{block.number}.</span>
					<p dir="rtl" class="flex-1 text-lg leading-relaxed line-clamp-2">{block.text.trim()}</p>
					{#if state === 'ready'}<Badge variant="secondary">Audio added</Badge>
					{:else if state === 'stale'}<Badge class="border-destructive text-destructive">Text changed</Badge>
					{:else}<Badge>No audio</Badge>{/if}
				</div>
				<MediaField accept="audio" compact bind:value={() => entry?.url ?? '', (url) => set(block, url)} placeholder="Choose recitation" />
				{#if state === 'stale'}
					<p class="text-xs text-muted-foreground">This text was edited after the audio was added, so the app won't play it. Upload a new recording, or confirm the old one still fits.</p>
					<Button variant="outline" size="sm" onclick={() => set(block, entry!.url)}>Audio still matches</Button>
				{/if}
			</div>
		{/each}
		{#each orphans as e (e.n)}
			<p class="text-xs text-muted-foreground">Audio {e.n} has no matching Arabic text any more and is ignored by the app.</p>
		{/each}
	</div>
{/if}
