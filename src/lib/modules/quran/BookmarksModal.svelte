<script lang="ts">
	import { goto } from '$app/navigation';
	import BookmarksOverlay from '#lib/components/shared/BookmarksOverlay.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { DEFAULT_ARABIC_FONT } from '#lib/quran-fonts.ts';
	import { quranBookmarks, type QuranBookmark } from '#lib/storage/bookmarks.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';

	interface Props {
		onclose: () => void;
		onnavigate?: (surahNumber: number, ayahNumber?: number) => void | Promise<void>;
	}
	let { onclose, onnavigate }: Props = $props();
	const t = useT('BookmarksModal');
	const n = useNum();

	function pick(b: QuranBookmark) {
		if (onnavigate) void onnavigate(b.surahNumber, b.ayahNumber);
		else void goto(localePath(`/quran/surah/${b.surahNumber}?ayah=${b.ayahNumber}`, currentLocale()));
		onclose();
	}
</script>

<BookmarksOverlay
	{onclose}
	title={t('title')}
	empty={t('empty')}
	removeLabel={t('remove')}
	items={[...quranBookmarks.all].reverse()}
	itemKey={(b) => `${b.surahNumber}-${b.ayahNumber}`}
	onpick={pick}
	onremove={quranBookmarks.remove}
>
	{#snippet row(b)}
		<div class="flex items-center gap-2 mb-1">
			<span class="text-xs font-semibold text-primary">{b.surahName}</span><span class="text-xs text-muted-foreground">{t('ayah', { number: n(b.ayahNumber) })}</span>
		</div>
		<p class="text-lg text-right text-foreground line-clamp-1" style:font-family={DEFAULT_ARABIC_FONT} style:direction="rtl">{b.arabic}</p>
	{/snippet}
</BookmarksOverlay>
