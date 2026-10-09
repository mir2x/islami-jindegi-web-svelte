<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import Button from './Button.svelte';

	/** Opens the live public-site page of the item being edited, in a new tab. */
	let { href }: { href: string } = $props();
</script>

<Button variant="outline" size="sm" href={localePath(href)} target="_blank" class="gap-1.5"><ExternalLink class="w-3.5 h-3.5" /> Public View</Button>
