<script lang="ts">
	import { page } from '$app/state';
	import { CONTENT, type ContentKey } from '#lib/admin/content/configs.ts';
	import ContentEdit from '#lib/admin/content/ContentEdit.svelte';

	const section = $derived(page.params.section as ContentKey);
</script>

{#key section}<ContentEdit config={CONTENT[section]} id={page.params.id!} />{/key}
