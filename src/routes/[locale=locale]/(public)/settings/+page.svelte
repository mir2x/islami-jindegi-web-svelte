<script lang="ts">
	import { onMount } from 'svelte';
	import SettingsForm from '#lib/modules/settings/SettingsForm.svelte';

	// Everything here comes from localStorage, so render nothing on the server and during hydration.
	let mounted = $state(false);
	onMount(() => (mounted = true));
</script>

{#if mounted}<SettingsForm />{/if}
