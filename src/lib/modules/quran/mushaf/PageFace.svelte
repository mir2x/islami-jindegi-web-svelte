<script lang="ts">
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { AyahBox } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		pageNum: number;
		url: string;
		/** Ayah boxes to highlight (selected and/or playing). */
		highlight: AyahBox[];
		editionWidth: number;
		editionHeight: number;
		onclick: (e: MouseEvent) => void;
		class?: string;
	}
	let { pageNum, url, highlight, editionWidth, editionHeight, onclick, class: className }: Props = $props();
	const t = useT('MushafReader');
	const n = useNum();
</script>

<!-- One page face: the page image, ayah highlights drawn over it, and the tap target. -->
<div role="presentation" class={cn('relative cursor-pointer', className)} {onclick}>
	{#key url}
		<img src={url} alt={t('pageAlt', { number: n(pageNum) })} decoding="async" draggable="false" class="w-full h-full block bg-white shadow-[0_4px_32px_rgba(0,0,0,0.25)]" />
	{/key}
	{#each highlight as box (box.box_id)}
		<div
			class="absolute rounded-[3px] pointer-events-none"
			style:left="{(box.min_x / editionWidth) * 100}%"
			style:top="{(box.min_y / editionHeight) * 100}%"
			style:width="{((box.max_x - box.min_x) / editionWidth) * 100}%"
			style:height="{((box.max_y - box.min_y) / editionHeight) * 100}%"
			style="background: rgba(34,197,94,0.22); border: 1.5px solid rgba(34,197,94,0.6)"
		></div>
	{/each}
</div>
