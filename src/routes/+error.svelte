<script lang="ts">
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
	const isEn = $derived(page.url.pathname === '/en' || page.url.pathname.startsWith('/en/'));
</script>

<svelte:head>
	<title>{page.status}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
	<p class="text-6xl font-bold text-primary/80 tabular-nums">{page.status}</p>
	<p class="mt-4 text-xl text-foreground">
		{#if notFound}{isEn ? 'Page not found' : 'পেজটি পাওয়া যায়নি'}{:else}{isEn ? 'Something went wrong' : 'কিছু একটা সমস্যা হয়েছে'}{/if}
	</p>
	{#if !notFound && page.error?.requestId}
		<!-- What a visitor can quote in a report: the id this failure was logged under. -->
		<p class="mt-2 text-xs text-muted-foreground font-mono select-all">{isEn ? 'Reference' : 'রেফারেন্স'}: {page.error.requestId}</p>
	{/if}
	<a href={isEn ? '/en' : '/bn'} class="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
		{isEn ? 'Back to home' : 'হোমে ফিরে যান'}
	</a>
</main>
