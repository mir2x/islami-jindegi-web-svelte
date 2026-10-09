<script lang="ts">
	import NamazTimes from '#lib/modules/namaz/NamazTimes.svelte';

	let { data } = $props();
</script>

<div class="overflow-hidden">
	<div class="overflow-y-auto lg:overflow-hidden px-4 py-6 lg:flex lg:flex-col" style="height: calc(100dvh - 68px)">
		<h1 class="sr-only">{data.heading}</h1>
		<div class="max-w-2xl lg:max-w-7xl mx-auto w-full lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
			<NamazTimes namazTimes={data.namazTimes} />
		</div>
	</div>
</div>
