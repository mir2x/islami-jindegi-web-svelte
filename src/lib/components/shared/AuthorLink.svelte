<script lang="ts">
	import { currentLocale, localePath } from '#lib/i18n/use-t.svelte.ts';

	/** An author's name as a link to their author page (linked by id; the page redirects to its slug URL). */
	let { id, name, class: cls = 'hover:text-primary transition-colors' }: { id: string; name: string; class?: string } = $props();
</script>

<a href={localePath(`/authors/${id}`, currentLocale())} class={cls}>{name}</a>
