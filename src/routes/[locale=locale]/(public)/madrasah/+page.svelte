<script lang="ts">
	import MadrasahList from '#lib/modules/madrasah/MadrasahList.svelte';

	let { data } = $props();
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
	<h1 class="sr-only">{data.heading}</h1>
	<MadrasahList items={data.items} total={data.total} pageNo={data.page} pageSize={20} search={data.search} />
</div>
