<script lang="ts">
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { PARA_NAMES } from './data.ts';
	import type { MushafIndex } from './mushaf-index.svelte.ts';

	interface Props {
		index: MushafIndex;
		navPara: number;
		/** The pages on screen (right and, in spread mode, left). */
		visiblePages: number[];
		onpara: (para: number) => void;
		ongoto: (page: number) => void;
	}
	let { index, navPara, visiblePages, onpara, ongoto }: Props = $props();
	const t = useT('MushafReader');
	const n = useNum();
	const head = 'shrink-0 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60';
	const cell = 'w-full transition-colors hover:bg-muted border-b border-border/40 disabled:opacity-40';
</script>

<div class="flex flex-1 overflow-hidden">
	<div class="flex-[3] flex flex-col overflow-hidden border-r border-border">
		<p class={head}>{t('colPara')}</p>
		<div class="flex-1 overflow-y-auto">
			{#each PARA_NAMES as name, i (i)}
				{@const on = navPara === i + 1}
				<button type="button" onclick={() => onpara(i + 1)} disabled={!index.paraPages.has(i + 1)} class={cn(cell, 'px-3 py-2.5 text-left', on && 'bg-primary/10')}>
					<p class={cn('text-sm', on ? 'font-bold text-primary' : 'text-foreground')}>{t('paraLabel', { number: n(i + 1) })}</p>
					<p class={cn('text-xs truncate', on ? 'text-primary/80' : 'text-muted-foreground')}>{name}</p>
				</button>
			{/each}
		</div>
	</div>
	<div class="flex-[2] flex flex-col overflow-hidden">
		<p class={head}>{t('colPage')}</p>
		<div class="flex-1 overflow-y-auto">
			{#each index.paraPages.get(navPara) ?? [] as actual, idx (actual)}
				<button
					type="button"
					onclick={() => ongoto(actual)}
					class={cn(cell, 'py-2.5 text-sm text-center', visiblePages.includes(actual) ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground')}>{n(idx + 1)}</button
				>
			{/each}
		</div>
	</div>
</div>
