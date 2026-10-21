<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<!-- Two word cards: the Arabic word on top, its meaning underneath. Drawn like the lucide icons (stroke = currentColor). -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class={className} aria-hidden="true">
	<rect x="2" y="5.5" width="9" height="13" rx="2.5" />
	<rect x="13" y="5.5" width="9" height="13" rx="2.5" />
	<path d="M4.4 10c.5-1.6 1.2-1.6 1.7-.2.4 1.4 1.2 1.4 1.8 0 .3-.7.7-1 1.1-1" />
	<path d="M15.4 10c.5-1.6 1.2-1.6 1.7-.2.4 1.4 1.2 1.4 1.8 0 .3-.7.7-1 1.1-1" />
	<path d="M4.9 15h3.8M15.9 15h3.8" />
</svg>
