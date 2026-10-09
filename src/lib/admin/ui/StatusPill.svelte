<script lang="ts">
	interface Props {
		published: boolean;
		/** Translated labels, for screens that are localised. */
		labels?: { published: string; draft: string };
	}
	let { published, labels = { published: 'Published', draft: 'Draft' } }: Props = $props();
</script>

{#if published}
	<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1"
		><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{labels.published}</span
	>
{:else}
	<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1"
		><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{labels.draft}</span
	>
{/if}
