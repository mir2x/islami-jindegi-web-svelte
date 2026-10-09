<script lang="ts">
	import { page } from '$app/state';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Header from '#lib/components/layout/Header.svelte';
	import SmartAppBanner from '#lib/components/layout/SmartAppBanner.svelte';
	import { organizationLd, webSiteLd } from '#lib/json-ld.ts';
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';

	let { children } = $props();

	// Brand-level structured data, on every public page.
	const ld = (block: Record<string, unknown>) => `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}<\/script>`;
	const blocks = $derived([webSiteLd(currentLocale()), organizationLd()]);
</script>

<svelte:head>
	{#each blocks as block, i (i)}{@html ld(block)}{/each}
</svelte:head>

<div class="flex flex-col min-h-screen">
	<SmartAppBanner />
	<Header />
	<main class="flex-1">{@render children()}</main>
	<Footer />
</div>
