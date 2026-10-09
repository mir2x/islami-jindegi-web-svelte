<script lang="ts">
	let { data } = $props();
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
	<h1 class="text-3xl font-bold text-foreground mb-6">{data.heading}</h1>
	{#if data.body}
		<div class="prose-content text-[15px] leading-relaxed text-foreground">{@html data.body}</div>
	{:else}
		<p class="text-muted-foreground py-16 text-center">{data.unavailable}</p>
	{/if}
</div>
