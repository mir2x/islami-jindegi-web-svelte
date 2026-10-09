<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Maximize from '@lucide/svelte/icons/maximize';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Star from '@lucide/svelte/icons/star';
	import { apiGet } from '#lib/client-api.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { quranBookmarks } from '#lib/storage/bookmarks.svelte.ts';
	import type { QuranAyahDetail } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { SURA_NAMES } from './data.ts';

	interface Props {
		sura: number;
		ayah: number;
		/** Anchor in the reader's coordinates: the menu floats just above it. */
		top: number;
		left: number;
		playing: boolean;
		onplay: () => void;
		onfullscreen: () => void;
		/** Dismiss the menu. */
		ondone: () => void;
	}
	let { sura, ayah, top, left, playing, onplay, onfullscreen, ondone }: Props = $props();

	const t = useT('MushafReader');
	const n = useNum();
	let busy = $state(false);
	let copied = $state(false);
	const bookmarked = $derived(quranBookmarks.has({ surahNumber: sura, ayahNumber: ayah }));

	async function arabic(): Promise<string> {
		const res = await apiGet<QuranAyahDetail>(`/api/quran/surahs/${sura}/ayahs/${ayah}?tafsirs=none&translations=none&words=false`);
		return res?.arabic ?? '';
	}
	async function bookmark() {
		if (busy) return;
		busy = true;
		const text = bookmarked ? '' : await arabic();
		quranBookmarks.toggle({ surahNumber: sura, ayahNumber: ayah, surahName: SURA_NAMES[sura - 1], arabic: text });
		busy = false;
	}
	async function copy() {
		if (busy) return;
		busy = true;
		const text = await arabic();
		busy = false;
		if (!text) return;
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => {
			copied = false;
			ondone();
		}, 900);
	}
	async function share() {
		if (busy) return;
		busy = true;
		const text = (await arabic()) || t('shareFallback', { surahName: SURA_NAMES[sura - 1], ayahNumber: n(ayah) });
		busy = false;
		if (navigator.share) await navigator.share({ text }).catch(() => {});
		else await navigator.clipboard.writeText(text);
		ondone();
	}
	const btn = 'flex items-center justify-center w-9 h-9 rounded-xl transition-colors disabled:opacity-50 hover:bg-muted';
</script>

<!-- Floating just above the selected ayah. -->
<div class="absolute z-40" style:top="{top}px" style:left="{left}px" style="transform: translate(-50%, -100%)">
	<div class="flex items-center gap-0.5 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-xl px-1.5 py-1">
		<span class="px-2 text-xs font-semibold text-muted-foreground whitespace-nowrap tabular-nums">{n(sura)}:{n(ayah)}</span>
		<button
			type="button"
			onclick={bookmark}
			disabled={busy}
			title={t('bookmarkAyah')}
			aria-label={t('bookmarkAyah')}
			class={cn(btn, bookmarked ? 'text-amber-500' : 'text-foreground')}><Star class={cn('w-4.5 h-4.5', bookmarked && 'fill-current')} /></button
		>
		<button type="button" onclick={onplay} title={t('listenAyah')} aria-label={t('listenAyah')} class="{btn} text-foreground"
			>{#if playing}<Pause class="w-4.5 h-4.5" />{:else}<Play class="w-4.5 h-4.5" />{/if}</button
		>
		<button type="button" onclick={copy} disabled={busy} title={t('copyAyah')} aria-label={t('copyAyah')} class={cn(btn, copied ? 'text-primary' : 'text-foreground')}
			>{#if copied}<Check class="w-4.5 h-4.5" />{:else}<Copy class="w-4.5 h-4.5" />{/if}</button
		>
		<button type="button" onclick={share} disabled={busy} title={t('shareAyah')} aria-label={t('shareAyah')} class="{btn} text-foreground"><Share2 class="w-4.5 h-4.5" /></button>
		<button type="button" onclick={onfullscreen} title={t('fullscreen')} aria-label={t('fullscreen')} class="{btn} text-foreground"><Maximize class="w-4.5 h-4.5" /></button>
	</div>
</div>
