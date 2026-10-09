<script lang="ts">
	import AudioPlayer from '#lib/components/media/AudioPlayer.svelte';
	import CategoryChips from './CategoryChips.svelte';

	interface Props {
		/** Intro CMS HTML shown above the player (question, body). */
		html?: string | null;
		/** Plain text intro when there is no HTML. */
		excerpt?: string | null;
		audioUrl: string;
		/** Namespace with the audio labels. */
		ns: string;
		categories: { id: string; title: string }[];
	}
	let { html, excerpt, audioUrl, ns, categories }: Props = $props();
</script>

<div>
	{#if html}
		<div class="prose-content text-base text-muted-foreground mb-6 leading-relaxed">{@html html}</div>
	{:else if excerpt}
		<p class="text-base text-muted-foreground mb-6 leading-relaxed">{excerpt}</p>
	{/if}
	{#key audioUrl}<AudioPlayer src={audioUrl} {ns} downloadHref={audioUrl} />{/key}
	<CategoryChips {categories} class="mt-6 pt-6 border-t border-border/60" />
</div>
