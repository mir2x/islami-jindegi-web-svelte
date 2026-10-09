<script lang="ts">
	import MushafReader from '#lib/modules/quran/mushaf/MushafReader.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">{data.edition.title}</h1>
<MushafReader edition={data.edition} initialPage={data.initialPage} reciters={data.reciters} />
