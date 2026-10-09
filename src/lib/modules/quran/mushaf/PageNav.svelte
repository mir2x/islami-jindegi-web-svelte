<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Star from '@lucide/svelte/icons/star';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		page: number;
		rightPage: number;
		leftPage: number | null;
		totalPages: number;
		bookmarked: boolean;
		onprev: () => void;
		onnext: () => void;
		ongoto: (page: number) => void;
		onbookmark: () => void;
	}
	let { page, rightPage, leftPage, totalPages, bookmarked, onprev, onnext, ongoto, onbookmark }: Props = $props();

	const t = useT('MushafReader');
	const n = useNum();
	let editing = $state(false);
	let input = $state('');
	const edge = 'flex items-center gap-1 py-2 rounded-full text-foreground hover:bg-muted disabled:opacity-30 transition-colors text-sm font-medium';

	function commit() {
		const v = parseInt(input, 10);
		if (!isNaN(v)) ongoto(v);
		editing = false;
	}
	const focusSelect = (el: HTMLInputElement) => el.select();
</script>

<!-- RTL: "next" is on the left and "previous" on the right. -->
<div class="flex items-center gap-0.5 px-1.5 py-1.5 rounded-full bg-background/95 backdrop-blur-md border border-border shadow-xl">
	<button type="button" onclick={onnext} disabled={page >= totalPages} class="{edge} pl-3 pr-3.5"><ChevronLeft class="w-4 h-4" />{t('nextPage')}</button>
	<div class="w-px h-5 bg-border"></div>

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
			class="mx-2 w-20 text-center text-foreground bg-muted border border-border rounded-lg px-2 py-1 text-sm tabular-nums outline-none focus:border-primary"
		/>
	{:else}
		<button
			type="button"
			onclick={() => {
				input = String(page);
				editing = true;
			}}
			class="px-2"
		>
			<span class="text-muted-foreground text-sm tabular-nums hover:text-foreground transition-colors">
				<span class="font-semibold text-foreground">{leftPage !== null ? `${n(rightPage)}–${n(leftPage)}` : n(rightPage)}</span><span class="mx-1">/</span>{n(totalPages)}
			</span>
		</button>
	{/if}
	<button
		type="button"
		onclick={onbookmark}
		title={t('pageBookmark')}
		aria-label={t('pageBookmark')}
		class={cn(
			'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
			bookmarked ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
		)}><Star class={cn('w-4 h-4', bookmarked && 'fill-current')} /></button
	>

	<div class="w-px h-5 bg-border"></div>
	<button type="button" onclick={onprev} disabled={page <= 1} class="{edge} pl-3.5 pr-3">{t('prevPage')}<ChevronRight class="w-4 h-4" /></button>
</div>
