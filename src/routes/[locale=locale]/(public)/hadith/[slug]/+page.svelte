<script lang="ts">
	import HadithBookView from '#lib/modules/hadith/HadithBookView.svelte';

	let { data } = $props();
</script>

<HadithBookView book={data.book} />
