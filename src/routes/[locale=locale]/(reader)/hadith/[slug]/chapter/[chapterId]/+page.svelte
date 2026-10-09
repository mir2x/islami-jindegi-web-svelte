<script lang="ts">
	import HadithReader from '#lib/modules/hadith/HadithReader.svelte';

	let { data } = $props();
</script>

<!-- Re-created per chapter so per-chapter state (search box, scroll position) starts fresh. -->
{#key data.detail.chapter.id}
	<HadithReader detail={data.detail} chapters={data.chapters} initialHadith={data.initialHadith} />
{/key}
