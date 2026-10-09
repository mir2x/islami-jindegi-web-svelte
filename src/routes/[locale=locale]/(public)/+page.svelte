<script lang="ts">
	import Home from '#lib/modules/home/Home.svelte';

	let { data } = $props();
</script>

<Home books={data.books} bayans={data.bayans} malfuzat={data.malfuzat} articles={data.articles} news={data.news} />
