<script lang="ts">
	import HadithLanding from '#lib/modules/hadith/HadithLanding.svelte';

	let { data } = $props();
</script>

<HadithLanding books={data.books} />
