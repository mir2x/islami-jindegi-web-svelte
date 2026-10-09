<script lang="ts">
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { AYAH_COUNTS, SURA_NAMES } from './data.ts';
	import type { MushafIndex } from './mushaf-index.svelte.ts';

	interface Props {
		index: MushafIndex;
		navSurah: number;
		currentAyah: { sura: number; ayah: number } | null;
		onsurah: (sura: number) => void;
		onayah: (sura: number, ayah: number) => void;
	}
	let { index, navSurah, currentAyah, onsurah, onayah }: Props = $props();
	const t = useT('MushafReader');
	const n = useNum();
	const head = 'shrink-0 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60';
	const cell = 'w-full text-left transition-colors hover:bg-muted border-b border-border/40 disabled:opacity-40';
</script>

<div class="flex flex-1 overflow-hidden">
	<div class="flex-[3] flex flex-col overflow-hidden border-r border-border">
		<p class={head}>{t('colSurah')}</p>
		<div class="flex-1 overflow-y-auto">
			{#each SURA_NAMES as name, i (i)}
				<button
					type="button"
					onclick={() => onsurah(i + 1)}
					disabled={!index.suraFirstPage.has(i + 1)}
					class={cn(cell, 'flex items-center gap-2 px-3 py-2.5', navSurah === i + 1 && 'bg-primary/10')}
				>
					<span class={cn('text-sm truncate', navSurah === i + 1 ? 'font-bold text-primary' : 'text-foreground')}>{n(i + 1)}. {name}</span>
				</button>
			{/each}
		</div>
	</div>
	<div class="flex-[2] flex flex-col overflow-hidden">
		<p class={head}>{t('colAyah')}</p>
		<div class="flex-1 overflow-y-auto">
			{#each Array.from({ length: AYAH_COUNTS[navSurah - 1] }, (_, k) => k + 1) as a (a)}
				<button
					type="button"
					onclick={() => onayah(navSurah, a)}
					disabled={!index.ayahFirstPage.has(`${navSurah}:${a}`)}
					class={cn(
						cell,
						'py-2.5 text-sm text-center',
						currentAyah?.sura === navSurah && currentAyah?.ayah === a ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'
					)}>{n(a)}</button
				>
			{/each}
		</div>
	</div>
</div>
