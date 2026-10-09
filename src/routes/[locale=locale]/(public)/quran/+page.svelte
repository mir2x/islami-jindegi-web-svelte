<script lang="ts">
	import QuranLanding from '#lib/modules/quran/QuranLanding.svelte';

	let { data } = $props();
</script>

<h1 class="sr-only">{data.heading}</h1>
<QuranLanding editions={data.editions} surahs={data.surahs} />
