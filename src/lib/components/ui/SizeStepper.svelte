<script lang="ts">
	import Type from '@lucide/svelte/icons/type';
	import { useNum } from '#lib/use-num.svelte.ts';

	/** `Aa − 28 +`: a font-size control. */
	let { size, onstep }: { size: number; onstep: (direction: 1 | -1) => void } = $props();
	const n = useNum();
	const btn = 'w-7 h-7 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/70 transition-colors';
</script>

<div class="flex items-center gap-2">
	<Type class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
	<button type="button" onclick={() => onstep(-1)} aria-label="Smaller" class={btn}>−</button>
	<span class="text-xs text-muted-foreground w-8 text-center tabular-nums">{n(size)}</span>
	<button type="button" onclick={() => onstep(1)} aria-label="Larger" class={btn}>+</button>
</div>
