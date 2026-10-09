<script lang="ts">
	import { currentLocale, localePath } from '#lib/i18n/use-t.svelte.ts';

	/** An item's categories as comma-separated links to their topic pages (linked by id; the topic page redirects to its slug URL). */
	let { categories }: { categories: { id: string; title: string }[] } = $props();
</script>

{#each categories as c, i (c.id)}{#if i > 0},
	{/if}<a href={localePath(`/topics/${c.id}`, currentLocale())} class="hover:text-primary transition-colors">{c.title}</a>{/each}
