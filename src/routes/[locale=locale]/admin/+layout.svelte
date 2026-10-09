<script lang="ts">
	import '../../../styles/admin.css';
	import Shell from '#lib/admin/shell/Shell.svelte';

	let { children } = $props();
</script>

<Shell>{@render children()}</Shell>
