<script lang="ts">
	import Explore from '#lib/modules/explore/Explore.svelte';

	let { data } = $props();
</script>

<Explore books={data.books} bayans={data.bayans} malfuzat={data.malfuzat} articles={data.articles} news={data.news} />
