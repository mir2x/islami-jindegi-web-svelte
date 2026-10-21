<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Star from '@lucide/svelte/icons/star';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { QuranReciter } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import type { MushafAudio } from './mushaf-audio.svelte.ts';

	interface Props {
		visible: boolean;
		audio: MushafAudio;
		reciters: QuranReciter[];
		reciterId: string;
		page: number;
		rightPage: number;
		leftPage: number | null;
		totalPages: number;
		bookmarked: boolean;
		onplay: () => void;
		onreciter: (id: string) => void;
		ongoto: (page: number) => void;
		onbookmark: () => void;
	}
	let { visible, audio, reciters, reciterId, page, rightPage, leftPage, totalPages, bookmarked, onplay, onreciter, ongoto, onbookmark }: Props = $props();

	const t = useT('MushafReader');
	const n = useNum();
	let editing = $state(false);
	let input = $state('');
	let menuOpen = $state(false);
	const reciterName = $derived(reciters.find((r) => r.id === reciterId)?.name ?? reciters[0]?.name ?? '');

	function commit() {
		const v = parseInt(input, 10);
		if (!isNaN(v)) ongoto(v);
		editing = false;
	}
	const focusSelect = (el: HTMLInputElement) => el.select();
	const round = 'flex items-center justify-center w-10 h-10 rounded-full transition-colors shrink-0';
</script>

<!-- Phones only: play, reciter, page and bookmark in one full-width bar (larger screens use the floating pills). -->
<div
	class={cn(
		'sm:hidden absolute bottom-0 inset-x-0 z-30 h-14 flex items-center gap-2 px-3 bg-background border-t border-border transition-all duration-300',
		visible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-2'
	)}
>
	<button type="button" onclick={onplay} aria-label={t('listenTilawat')} class="{round} text-foreground hover:bg-muted">
		{#if audio.loading}<LoaderCircle class="w-5 h-5 animate-spin" />{:else if audio.playing}<Pause class="w-5 h-5" />{:else}<Play class="w-5 h-5" />{/if}
	</button>

	{#if reciters.length > 0}
		<div class="relative flex-1 min-w-0">
			<button
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="ক্বারী"
				aria-expanded={menuOpen}
				class="w-full h-10 flex items-center justify-between gap-2 px-3 rounded-xl border border-border bg-muted text-sm text-foreground"
			>
				<span class="truncate">{reciterName}</span>
				<ChevronDown class={cn('w-4 h-4 shrink-0 text-muted-foreground transition-transform', menuOpen && 'rotate-180')} />
			</button>
			{#if menuOpen}
				<button type="button" tabindex="-1" aria-label="Close" onclick={() => (menuOpen = false)} class="fixed inset-0 z-40 cursor-default"></button>
				<ul class="absolute bottom-full left-0 right-0 mb-2 z-50 max-h-64 overflow-y-auto rounded-xl border border-border bg-background shadow-xl py-1">
					{#each reciters as r (r.id)}
						<li>
							<button
								type="button"
								onclick={() => {
									onreciter(r.id);
									menuOpen = false;
								}}
								class={cn('w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted', r.id === reciterId ? 'text-primary font-semibold' : 'text-foreground')}
							>
								<span class="truncate">{r.name}</span>
								{#if r.id === reciterId}<Check class="w-4 h-4 shrink-0" />{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	{#if editing}
		<input
			use:focusSelect
			bind:value={input}
			onblur={commit}
			onkeydown={(e) => e.key === 'Enter' && commit()}
			type="number"
			min={1}
			max={totalPages}
			aria-label={t('pageBookmark')}
			class="w-16 shrink-0 text-center text-foreground bg-muted border border-border rounded-lg px-2 py-1 text-sm tabular-nums outline-none focus:border-primary"
		/>
	{:else}
		<button
			type="button"
			onclick={() => {
				input = String(page);
				editing = true;
			}}
			class="shrink-0 px-1 text-muted-foreground text-sm tabular-nums"
		>
			<span class="font-semibold text-foreground">{leftPage !== null ? `${n(rightPage)}–${n(leftPage)}` : n(rightPage)}</span><span class="mx-1">/</span>{n(totalPages)}
		</button>
	{/if}

	<button
		type="button"
		onclick={onbookmark}
		aria-label={t('pageBookmark')}
		class={cn(round, bookmarked ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}><Star class={cn('w-5 h-5', bookmarked && 'fill-current')} /></button
	>
</div>
