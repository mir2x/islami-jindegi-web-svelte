<script lang="ts">
	import { page } from '$app/state';
	import { CONTENT, type ContentKey } from '#lib/admin/content/configs.ts';
	import ContentList from '#lib/admin/content/ContentList.svelte';

	const section = $derived(page.params.section as ContentKey);
</script>

<!-- Keyed: switching between sections reuses this route, but each list owns its own state. -->
{#key section}<ContentList config={CONTENT[section]} />{/key}
