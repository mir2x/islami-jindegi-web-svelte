<script lang="ts">
	import { page } from '$app/state';
	import { CONTENT, type ContentKey } from '#lib/admin/content/configs.ts';
	import ContentForm from '#lib/admin/content/ContentForm.svelte';

	const section = $derived(page.params.section as ContentKey);
</script>

{#key section}<ContentForm config={CONTENT[section]} />{/key}
