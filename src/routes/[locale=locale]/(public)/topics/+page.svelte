<script lang="ts">
	import TopicsIndex from '#lib/modules/topics/TopicsIndex.svelte';

	let { data } = $props();
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
	<h1 class="text-3xl sm:text-4xl font-bold text-foreground">{data.heading}</h1>
	<p class="text-lg text-muted-foreground mt-2 mb-8">{data.subheading}</p>
	<TopicsIndex index={data.index} />
</div>
