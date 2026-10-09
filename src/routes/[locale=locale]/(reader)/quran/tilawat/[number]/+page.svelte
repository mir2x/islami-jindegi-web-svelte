<script lang="ts">
	import TilawatReader from '#lib/modules/quran/TilawatReader.svelte';

	let { data } = $props();
</script>

<!-- Re-created per surah so the selection and open panels start fresh. -->
{#key data.surah.surahNumber}<TilawatReader surah={data.surah} allSurahs={data.allSurahs} />{/key}
