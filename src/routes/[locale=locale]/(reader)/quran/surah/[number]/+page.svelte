<script lang="ts">
	import SurahReader from '#lib/modules/quran/SurahReader.svelte';

	let { data } = $props();
</script>

<SurahReader surah={data.surah} allSurahs={data.allSurahs} reciters={data.reciters} translators={data.translators} initialAyah={data.initialAyah} />
