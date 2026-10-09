<script lang="ts">
	import '../app.css';
	import Seo from '#lib/components/Seo.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

{#if page.data.seo}<Seo seo={page.data.seo} />{/if}
{@render children()}
