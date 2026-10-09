<script lang="ts">
	import { NEXT_PUBLIC_NOINDEX, NEXT_PUBLIC_SITE_URL as SITE } from '$app/env/public';
	import type { SeoData } from '#lib/seo.ts';

	let { seo }: { seo: SeoData } = $props();

	const abs = (path: string) => (path.startsWith('http') ? path : `${SITE}${path}`);
	const noindex = NEXT_PUBLIC_NOINDEX === '1';
	// JSON-LD sits inside a <script>, so `<` is escaped: the data can contain CMS text.
	const ld = (block: Record<string, unknown>) => `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}<\/script>`;
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	{#if seo.keywords?.length}<meta name="keywords" content={seo.keywords.join(', ')} />{/if}
	<meta name="robots" content={noindex ? 'noindex, nofollow' : seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
	<link rel="canonical" href={abs(seo.canonical)} />
	{#if seo.languages}
		{#each Object.entries(seo.languages) as [lang, path] (lang)}
			<link rel="alternate" hreflang={lang} href={abs(path)} />
		{/each}
	{/if}

	<meta property="og:type" content={seo.og.type} />
	<meta property="og:site_name" content={seo.og.siteName} />
	<meta property="og:title" content={seo.og.title} />
	<meta property="og:description" content={seo.og.description} />
	<meta property="og:url" content={abs(seo.og.url)} />
	<meta property="og:locale" content={seo.og.locale} />
	{#if seo.og.alternateLocale}<meta property="og:locale:alternate" content={seo.og.alternateLocale} />{/if}
	<meta property="og:image" content={abs(seo.og.image)} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={seo.og.imageAlt} />
	{#if seo.og.publishedTime}<meta property="article:published_time" content={seo.og.publishedTime} />{/if}
	{#each seo.og.authors ?? [] as author (author)}<meta property="article:author" content={author} />{/each}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.og.title} />
	<meta name="twitter:description" content={seo.og.description} />
	<meta name="twitter:image" content={abs(seo.og.image)} />

	{#each seo.jsonLd ?? [] as block, i (i)}{@html ld(block)}{/each}
</svelte:head>
