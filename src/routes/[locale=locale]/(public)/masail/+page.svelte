<script lang="ts">
	import { browserSnapshot } from '#lib/components/browser/snapshot.svelte.ts';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import MasailBrowser from '#lib/modules/masail/MasailBrowser.svelte';

	// Going back from a detail page restores the loaded list and scroll position.
	export const snapshot = browserSnapshot;

	let { data } = $props();
	const t = useT('MasailPage');
</script>

<div class="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 lg:h-[calc(100vh-68px)] lg:flex lg:flex-col">
	<h1 class="sr-only">{data.heading}</h1>
	<p class="shrink-0 mb-4 text-sm text-muted-foreground text-end">
		{t('askPrompt')} <a href={localePath('/ask-masail')} class="font-semibold text-primary hover:underline">{t('askLink')}</a>
	</p>
	{#key data}<MasailBrowser initial={data.initial} authors={data.authors} categories={data.categories} />{/key}
</div>
