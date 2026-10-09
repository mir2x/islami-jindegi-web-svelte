<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<section class="rounded-2xl border border-border bg-card p-5 sm:p-6">
	<h2 class="text-sm font-bold uppercase tracking-wider text-primary mb-5">{title}</h2>
	<div class="space-y-5">{@render children()}</div>
</section>
