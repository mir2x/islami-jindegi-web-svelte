<script lang="ts">
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import BookOpenText from '@lucide/svelte/icons/book-open-text';
	import Copy from '@lucide/svelte/icons/copy';
	import Play from '@lucide/svelte/icons/play';
	import Share2 from '@lucide/svelte/icons/share-2';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { quranBookmarks } from '#lib/storage/bookmarks.svelte.ts';
	import type { QuranAyah } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		ayah: QuranAyah;
		surahNumber: number;
		surahName: string;
		translators: string[];
		showWords: boolean;
		active: boolean;
		onplay: () => void;
		onplaysingle: () => void;
		ontafsir: () => void;
	}
	let { ayah, surahNumber, surahName, translators, showWords, active, onplay, onplaysingle, ontafsir }: Props = $props();

	const t = useT('SurahReader');
	const n = useNum();
	const shown = $derived(ayah.translations.filter((tr) => translators.includes(tr.translator)));
	const bookmarked = $derived(quranBookmarks.has({ surahNumber, ayahNumber: ayah.number }));
	let copied = $state(false);

	const text = () => [ayah.arabic, ...shown.map((tr) => tr.text)].join('\n');
	function copy() {
		navigator.clipboard.writeText(text()).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1500);
		});
	}
	const share = () => (navigator.share ? navigator.share({ text: text() }) : navigator.clipboard.writeText(window.location.href));
	const bookmark = () => quranBookmarks.toggle({ surahNumber, ayahNumber: ayah.number, surahName, arabic: ayah.arabic });
	const tool = (on: boolean) => cn('p-1.5 rounded-md transition-colors', on ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted');
</script>

<div data-ayah={ayah.number} class={cn('py-6 border-b border-border/60 transition-colors', active && 'bg-primary/5 -mx-4 px-4 rounded-lg border-primary/20')}>
	<div class="flex items-center justify-between mb-4">
		<button
			type="button"
			onclick={onplay}
			title={t('playAyah', { number: n(ayah.number) })}
			aria-label={t('playAyah', { number: n(ayah.number) })}
			class={cn(
				'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0',
				active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
			)}>{n(ayah.number)}</button
		>
		<div class="flex items-center gap-0.5">
			{#if active}
				<div class="flex gap-0.5 items-end h-4 mr-2" aria-hidden="true">
					{#each [60, 100, 40] as h, i (i)}<span class="w-0.5 bg-primary rounded-full animate-bounce" style:height="{h}%" style:animation-delay="{(i + 1) * 0.1}s"></span>{/each}
				</div>
			{/if}
			<button type="button" onclick={onplaysingle} title={t('playThisAyah')} aria-label={t('playThisAyah')} class={tool(active)}><Play class="w-3.5 h-3.5" /></button>
			<button type="button" onclick={copy} title={t('copy')} aria-label={t('copy')} class={tool(copied)}><Copy class="w-3.5 h-3.5" /></button>
			<button type="button" onclick={share} title={t('share')} aria-label={t('share')} class={tool(false)}><Share2 class="w-3.5 h-3.5" /></button>
			<button type="button" onclick={bookmark} title={t('bookmark')} aria-label={t('bookmark')} class={tool(bookmarked)}
				><Bookmark class={cn('w-3.5 h-3.5', bookmarked && 'fill-current')} /></button
			>
			<button type="button" onclick={ontafsir} title={t('viewTafsir')} aria-label={t('viewTafsir')} class={tool(false)}><BookOpenText class="w-3.5 h-3.5" /></button>
		</div>
	</div>

	<p class="text-right leading-[2.2] text-foreground mb-5" style="font-family: var(--quran-arabic-font); direction: rtl; font-size: var(--quran-arabic-size)">{ayah.arabic}</p>

	{#if showWords && ayah.words.length > 0}
		<div class="flex flex-wrap gap-2 justify-end mb-4 p-3 rounded-xl bg-muted/40" dir="rtl">
			{#each ayah.words as w (w.id)}
				<div class="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-muted border border-border">
					<span class="text-base text-foreground" style="font-family: var(--quran-arabic-font)">{w.arabic}</span>
					<span class="text-[11px] text-muted-foreground">{w.bengali}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if shown.length > 0}
		<div class="space-y-3">
			{#each shown as tr (tr.translator)}
				<div>
					{#if shown.length > 1}<p class="text-xs font-semibold text-primary/80 mb-1">{tr.translator}</p>{/if}
					<p class="text-muted-foreground leading-relaxed" style="font-family: var(--quran-bengali-font); font-size: var(--quran-bengali-size)">{tr.text}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
