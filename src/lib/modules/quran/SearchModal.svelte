<script lang="ts">
	import { goto } from '$app/navigation';
	import Highlight from '#lib/components/shared/Highlight.svelte';
	import SearchOverlay from '#lib/components/shared/SearchOverlay.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { DEFAULT_ARABIC_FONT } from '#lib/quran-fonts.ts';
	import type { QuranSearchHit } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';

	interface Props {
		onclose: () => void;
		/** Readers jump within themselves; the landing page navigates to the surah reader. */
		onnavigate?: (surahNumber: number, ayahNumber?: number) => void | Promise<void>;
	}
	let { onclose, onnavigate }: Props = $props();

	const t = useT('QuranSearchModal');
	const n = useNum();

	function go(hit: QuranSearchHit) {
		if (onnavigate) void onnavigate(hit.surahNumber, hit.ayahNumber);
		else void goto(localePath(`/quran/surah/${hit.surahNumber}?ayah=${hit.ayahNumber}`, currentLocale()));
		onclose();
	}
</script>

<SearchOverlay
	{onclose}
	{t}
	path={(q, page) => `/api/quran/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=20`}
	hitKey={(h: QuranSearchHit) => `${h.surahNumber}-${h.ayahNumber}`}
>
	{#snippet hit(h: QuranSearchHit, query: string)}
		<button type="button" onclick={() => go(h)} class="w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
			<div class="flex items-center gap-2 mb-1.5">
				<span class="text-xs font-semibold text-primary">{h.surahName}</span><span class="text-xs text-muted-foreground">{t('ayah', { number: n(h.ayahNumber) })}</span>
			</div>
			<p class="text-lg text-right text-foreground mb-1.5" style:font-family={DEFAULT_ARABIC_FONT} style:direction="rtl"><Highlight text={h.arabic} {query} /></p>
			{#if h.translations[0]}<p class="text-sm text-muted-foreground line-clamp-2"><Highlight text={h.translations[0].text} {query} /></p>{/if}
		</button>
	{/snippet}
</SearchOverlay>
