<script lang="ts">
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';

	let { children } = $props();

	// The server sets <html lang>; keep it right when the language is switched without a reload.
	$effect(() => {
		document.documentElement.lang = currentLocale();
	});
</script>

{@render children()}
