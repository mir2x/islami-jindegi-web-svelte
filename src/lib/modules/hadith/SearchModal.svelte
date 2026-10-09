<script lang="ts">
	import { goto } from '$app/navigation';
	import Highlight from '#lib/components/shared/Highlight.svelte';
	import SearchOverlay from '#lib/components/shared/SearchOverlay.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { DEFAULT_ARABIC_FONT } from '#lib/quran-fonts.ts';
	import type { HadithSearchHit } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { hadithHref } from './common.ts';
	import GradeBadge from './GradeBadge.svelte';

	interface Props {
		onclose: () => void;
		/** When set, the modal offers to restrict the search to this book (and does so by default). */
		book?: { slug: string; title: string };
	}
	let { onclose, book }: Props = $props();

	const t = useT('HadithSearchModal');
	const n = useNum();
	// svelte-ignore state_referenced_locally
	let scopeBook = $state(!!book);

	const path = (q: string, page: number) =>
		`/api/hadith/search?q=${encodeURIComponent(q)}${scopeBook && book ? `&book=${encodeURIComponent(book.slug)}` : ''}&page=${page}&pageSize=20`;
	function go(hit: HadithSearchHit) {
		void goto(localePath(hadithHref(hit.bookSlug, hit.chapterId, hit.hadithNumber), currentLocale()));
		onclose();
	}
	// Centre the snippet on the match: hadith texts are long and the hit is often past the clamp.
	function snippet(text: string, query: string) {
		const plain = text.replace(/<[^>]+>/g, '');
		const idx = plain.toLowerCase().indexOf(query.toLowerCase());
		return idx > 80 ? '…' + plain.slice(idx - 60) : plain;
	}
</script>

<SearchOverlay {onclose} {t} {path} scope={scopeBook} hitKey={(h: HadithSearchHit) => h.id}>
	{#snippet toolbar()}
		{#if book}
			<div class="shrink-0 flex gap-2 px-4 py-2 border-b border-border">
				{#each [false, true] as inBook (inBook)}
					<button
						type="button"
						onclick={() => (scopeBook = inBook)}
						class={cn(
							'px-3 py-1 rounded-lg text-xs transition-colors',
							scopeBook === inBook ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
						)}
					>
						{inBook ? t('scopeBook', { book: book.title }) : t('scopeAll')}
					</button>
				{/each}
			</div>
		{/if}
	{/snippet}
	{#snippet hit(h: HadithSearchHit, query: string)}
		<button type="button" onclick={() => go(h)} class="w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
			<div class="flex items-center gap-2 mb-1.5">
				<span class="text-xs font-semibold text-primary">{h.bookTitle}</span>
				<span class="text-xs text-muted-foreground">{t('hadith', { number: n(h.hadithNumber) })}</span>
				<GradeBadge gradeBn={h.gradeBn} class="ml-auto" />
			</div>
			{#if h.descriptionAr}<p class="text-lg text-right text-foreground mb-1.5 line-clamp-2" style:font-family={DEFAULT_ARABIC_FONT} style:direction="rtl">
					{h.descriptionAr}
				</p>{/if}
			<p class="text-sm text-muted-foreground line-clamp-3"><Highlight text={snippet(h.description, query)} {query} /></p>
		</button>
	{/snippet}
</SearchOverlay>
