<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
	<p class="text-sm font-medium text-foreground">{label}</p>
	<div class="sm:w-[280px] shrink-0">{@render children()}</div>
</div>
