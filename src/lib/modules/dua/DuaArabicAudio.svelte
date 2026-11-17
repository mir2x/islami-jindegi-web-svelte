<script lang="ts">
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Repeat1 from '@lucide/svelte/icons/repeat-1';
	import SkipBack from '@lucide/svelte/icons/skip-back';
	import SkipForward from '@lucide/svelte/icons/skip-forward';
	import Square from '@lucide/svelte/icons/square';
	import { mount, unmount, untrack, type Snippet } from 'svelte';
	import { blockHash, isMostlyArabic, parseEntries } from '#lib/admin/content/arabic-audio.ts';
	import { formatNum } from '#lib/calendar.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import ArabicPlayButton from './ArabicPlayButton.svelte';
	import { ArabicPlayer } from './arabic-player.svelte.ts';

	interface Props {
		/** The dua's `arabicAudios` JSON: a recitation per Arabic block, stamped with the hash of the text it was recorded for. */
		audios: string | null | undefined;
		/** The body HTML; the blocks are found again whenever it changes. */
		html: string | null | undefined;
		/** Namespace holding the arabicAudio* labels. */
		ns: string;
		children: Snippet;
	}
	let { audios, html, ns, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	const t = useT(ns);
	const locale = $derived(currentLocale());

	let root = $state<HTMLElement>();
	const player = new ArabicPlayer();
	let notice = $state(false);

	/**
	 * Gives every Arabic block of the rendered body (a top-level element marked dir="rtl" or written mostly in
	 * Arabic, the rule the app and the admin use) a listen button at its start, as the app does. Runs in the
	 * browser only: the server sends the plain body, so the text reads the same without script.
	 */
	$effect(() => {
		void html;
		const body = root?.querySelector<HTMLElement>('.prose-content');
		const raw = audios;
		if (!body) return;
		return untrack(() => enhance(body, raw));
	});

	function enhance(body: HTMLElement, raw: string | null | undefined) {
		const entries = parseEntries(raw);
		const urls = new Map<number, string>();
		const added: { wrap: HTMLElement; el: Element; button: ReturnType<typeof mount> }[] = [];
		let n = 0;
		for (const el of Array.from(body.children)) {
			const text = el.textContent ?? '';
			if (el.getAttribute('dir') !== 'rtl' && !isMostlyArabic(text)) continue;
			const number = ++n;
			const entry = entries.find((e) => e.n === number);
			// A recording made for older text is never played.
			if (entry && entry.hash === blockHash(text)) urls.set(number, entry.url);
			const wrap = document.createElement('div');
			wrap.className = 'dua-arabic flex items-start gap-2 rounded-xl -mx-2 px-2 py-1 my-1 transition-colors';
			wrap.dataset.block = String(number);
			el.before(wrap);
			wrap.append(el);
			el.classList.add('flex-1', 'min-w-0');
			const button = mount(ArabicPlayButton, { target: wrap, anchor: el, props: { player, number, label: t('arabicAudioPlay') } });
			added.push({ wrap, el, button });
		}
		player.urls = urls;
		return () => {
			player.stop();
			for (const { wrap, el, button } of added) {
				unmount(button);
				el.classList.remove('flex-1', 'min-w-0');
				wrap.replaceWith(el);
			}
		};
	}

	// Tint the block being played, as the app does.
	$effect(() => {
		const current = player.current;
		for (const w of root?.querySelectorAll<HTMLElement>('.dua-arabic') ?? []) w.classList.toggle('bg-primary/8', w.dataset.block === String(current));
	});

	// Another player on the page (the dua's full audio) starting stops the recitation.
	$effect(() => {
		const onPlay = (e: Event) => {
			if (player.current != null && e.target instanceof HTMLMediaElement) player.stop();
		};
		document.addEventListener('play', onPlay, true);
		return () => document.removeEventListener('play', onPlay, true);
	});

	$effect(() => {
		if (!player.unavailableAt) return;
		notice = true;
		const id = setTimeout(() => (notice = false), 3000);
		return () => clearTimeout(id);
	});

	$effect(() => () => player.destroy());

	const btn = 'p-2 rounded-full text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors';
</script>

<div bind:this={root}>{@render children()}</div>
<!-- Room for the player bar, so it never covers the end of the dua. -->
{#if player.current != null}<div class="h-20 print:hidden" aria-hidden="true"></div>{/if}

{#if notice}
	<div role="status" class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded-lg bg-foreground px-4 py-2.5 text-sm text-background shadow-lg print:hidden">
		{t('arabicAudioUnavailable')}
	</div>
{/if}

{#if player.current != null}
	<div class="fixed inset-x-0 bottom-0 z-40 print:hidden">
		<div class="mx-auto max-w-3xl rounded-t-2xl border border-b-0 border-border bg-card shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
			<div class="flex items-center gap-1 px-3 h-15 pb-[env(safe-area-inset-bottom)]">
				<p class="flex-1 min-w-0 truncate text-sm font-semibold text-foreground">
					{t('arabicAudioPart', { number: formatNum(player.current, locale) })}
					{#if player.failed}<span class="ms-2 font-normal text-destructive">{t('arabicAudioError')}</span>{/if}
				</p>
				<button type="button" class={btn} aria-label={t('arabicAudioPrevious')} title={t('arabicAudioPrevious')} onclick={player.previous}><SkipBack class="w-5 h-5" /></button>
				<button type="button" class={btn} aria-label={player.playing ? t('arabicAudioPause') : t('arabicAudioResume')} onclick={player.toggleCurrent}>
					{#if player.playing}<Pause class="w-5 h-5" />{:else}<Play class="w-5 h-5" />{/if}
				</button>
				<button type="button" class={btn} aria-label={t('arabicAudioStop')} title={t('arabicAudioStop')} onclick={player.stop}><Square class="w-5 h-5" /></button>
				<button type="button" class={btn} aria-label={t('arabicAudioNext')} title={t('arabicAudioNext')} onclick={player.next}><SkipForward class="w-5 h-5" /></button>
				<button
					type="button"
					class={cn(btn, player.repeat ? 'text-primary bg-primary/10' : '')}
					aria-label={t('arabicAudioRepeat')}
					aria-pressed={player.repeat}
					title={t('arabicAudioRepeat')}
					onclick={player.toggleRepeat}><Repeat1 class="w-5 h-5" /></button
				>
				<button
					type="button"
					class="ms-1 min-w-12 rounded-full border border-border px-2 py-1 text-xs font-semibold tabular-nums text-foreground hover:border-primary transition-colors"
					aria-label={t('arabicAudioSpeed')}
					title={t('arabicAudioSpeed')}
					onclick={player.cycleSpeed}
				>
					{formatNum(player.speed, locale)}x
				</button>
			</div>
		</div>
	</div>
{/if}
