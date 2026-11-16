<script lang="ts">
	import AskForm from '#lib/modules/masail/AskForm.svelte';

	let { data } = $props();
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
	<h1 class="text-3xl font-bold text-foreground mb-6">{data.heading}</h1>
	{#if data.body}
		<div class="prose-content text-[15px] leading-relaxed text-foreground mb-8">{@html data.body}</div>
	{/if}
	<AskForm />
</div>
