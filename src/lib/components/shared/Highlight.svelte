<script lang="ts">
	/** Text with the first occurrence of `query` marked. */
	let { text, query }: { text: string; query: string } = $props();
	const idx = $derived(query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1);
</script>

{#if idx === -1}{text}{:else}{text.slice(0, idx)}<mark class="bg-primary/20 text-foreground rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>{text.slice(
		idx + query.length
	)}{/if}
