<script lang="ts">
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Share2 from '@lucide/svelte/icons/share-2';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { hadithBookmarks } from '#lib/storage/bookmarks.svelte.ts';
	import type { HadithItem } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { stripTags } from './common.ts';
	import HadithText from './HadithText.svelte';

	interface Props {
		hadith: HadithItem;
		bookSlug: string;
		bookTitle: string;
		chapterId: number;
		showArabic: boolean;
		isActive: boolean;
	}
	let { hadith, bookSlug, bookTitle, chapterId, showArabic, isActive }: Props = $props();

	const t = useT('HadithReader');
	const n = useNum();
	const bookmarked = $derived(hadithBookmarks.has({ bookSlug, hadithNumber: hadith.hadithNumber }));
	let copied = $state(false);
	let shared = $state(false);

	const plainText = () =>
		[
			`${bookTitle} — ${t('hadithNumber', { number: n(hadith.hadithNumber) })}`,
			hadith.descriptionAr ? stripTags(hadith.descriptionAr) : null,
			stripTags(hadith.description),
			hadith.gradeBn,
			hadith.reference
		]
			.filter(Boolean)
			.join('\n\n');

	function flash(set: (v: boolean) => void) {
		set(true);
		setTimeout(() => set(false), 1500);
	}
	const copy = () => navigator.clipboard.writeText(plainText()).then(() => flash((v) => (copied = v)));
	function share() {
		const url = `${window.location.origin}/${currentLocale()}/hadith/${bookSlug}/${hadith.hadithNumber}`;
		if (navigator.share) navigator.share({ text: plainText(), url }).catch(() => {});
		else navigator.clipboard.writeText(url).then(() => flash((v) => (shared = v)));
	}
	const toggleBookmark = () => hadithBookmarks.toggle({ bookSlug, bookTitle, chapterId, hadithNumber: hadith.hadithNumber, excerpt: stripTags(hadith.description).slice(0, 160) });
	const tool = (on: boolean) => cn('p-1.5 rounded-md transition-colors', on ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted');
</script>

<div
	data-hadith={hadith.hadithNumber}
	class={cn('py-6 border-b border-border/60 transition-colors scroll-mt-4', isActive && 'bg-primary/5 -mx-4 px-4 rounded-lg border-primary/20')}
>
	<div class="flex items-center justify-between gap-2 mb-4">
		<span
			class={cn(
				'min-w-8 h-8 px-2 rounded-full flex items-center justify-center text-sm font-bold shrink-0 tabular-nums',
				isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
			)}>{n(hadith.hadithNumber)}</span
		>
		<div class="flex items-center gap-0.5 shrink-0">
			<button type="button" onclick={copy} title={t('copy')} aria-label={t('copy')} class={tool(copied)}
				>{#if copied}<Check class="w-3.5 h-3.5" />{:else}<Copy class="w-3.5 h-3.5" />{/if}</button
			>
			<button type="button" onclick={share} title={t('share')} aria-label={t('share')} class={tool(shared)}
				>{#if shared}<Check class="w-3.5 h-3.5" />{:else}<Share2 class="w-3.5 h-3.5" />{/if}</button
			>
			<button type="button" onclick={toggleBookmark} title={t('bookmark')} aria-label={t('bookmark')} class={tool(bookmarked)}
				><Bookmark class={cn('w-3.5 h-3.5', bookmarked && 'fill-current')} /></button
			>
		</div>
	</div>

	{#if showArabic && hadith.descriptionAr}
		<HadithText
			text={hadith.descriptionAr}
			class="text-right leading-[2] text-foreground mb-5"
			style="font-family: var(--hadith-arabic-font); direction: rtl; font-size: var(--hadith-arabic-size)"
		/>
	{/if}
	{#if hadith.rabiNameBn}<p class="text-sm text-muted-foreground mb-2"><span class="font-semibold">{t('narrator')}:</span> {hadith.rabiNameBn}</p>{/if}
	<HadithText text={hadith.description} class="text-foreground/90 leading-relaxed" style="font-family: var(--hadith-bengali-font); font-size: var(--hadith-bengali-size)" />
	{#if hadith.reference}<p class="mt-3 text-sm text-muted-foreground"><span class="font-semibold">{t('reference')}:</span> {stripTags(hadith.reference)}</p>{/if}
</div>
