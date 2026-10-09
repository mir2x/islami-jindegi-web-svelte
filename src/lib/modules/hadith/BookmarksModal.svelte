<script lang="ts">
	import { goto } from '$app/navigation';
	import BookmarksOverlay from '#lib/components/shared/BookmarksOverlay.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { hadithBookmarks, type HadithBookmark } from '#lib/storage/bookmarks.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { hadithHref } from './common.ts';

	let { onclose }: { onclose: () => void } = $props();
	const t = useT('HadithBookmarksModal');
	const n = useNum();

	function pick(b: HadithBookmark) {
		void goto(localePath(hadithHref(b.bookSlug, b.chapterId, b.hadithNumber), currentLocale()));
		onclose();
	}
</script>

<BookmarksOverlay
	{onclose}
	title={t('title')}
	empty={t('empty')}
	removeLabel={t('remove')}
	items={[...hadithBookmarks.all].reverse()}
	itemKey={(b) => `${b.bookSlug}-${b.hadithNumber}`}
	onpick={pick}
	onremove={hadithBookmarks.remove}
>
	{#snippet row(b)}
		<div class="flex items-center gap-2 mb-1">
			<span class="text-xs font-semibold text-primary">{b.bookTitle}</span><span class="text-xs text-muted-foreground">{t('hadith', { number: n(b.hadithNumber) })}</span>
		</div>
		<p class="text-sm text-muted-foreground line-clamp-2">{b.excerpt}</p>
	{/snippet}
</BookmarksOverlay>
