<script lang="ts">
	import Header from '#lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<div class="flex flex-col h-screen overflow-hidden">
	<div class="shrink-0 border-b border-border/60 z-50 bg-background/95">
		<Header />
	</div>
	<div class="flex-1 min-h-0 relative overflow-hidden">{@render children()}</div>
</div>
