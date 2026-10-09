<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import { bn } from '#lib/bengali-numerals.ts';
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';

	const MIN = 70;
	const MAX = 200;
	const STEP = 10;
	let { zoom = $bindable(100) }: { zoom: number } = $props();

	const btn =
		'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-transparent';
</script>

<!-- Scales a detail panel's content pane only, not the page. -->
<div class="flex items-center gap-0.5">
	<button type="button" onclick={() => (zoom = Math.max(MIN, zoom - STEP))} disabled={zoom <= MIN} title="Zoom out" aria-label="Zoom out" class={btn}
		><Minus class="w-4 h-4" /></button
	>
	<span class="text-sm text-muted-foreground tabular-nums w-11 text-center select-none">{currentLocale() === 'bn' ? bn(zoom) : zoom}%</span>
	<button type="button" onclick={() => (zoom = Math.min(MAX, zoom + STEP))} disabled={zoom >= MAX} title="Zoom in" aria-label="Zoom in" class={btn}><Plus class="w-4 h-4" /></button
	>
</div>
