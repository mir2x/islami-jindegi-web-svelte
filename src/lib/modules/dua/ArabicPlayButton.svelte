<script lang="ts">
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import type { ArabicPlayer } from './arabic-player.svelte.ts';

	let { player, number, label }: { player: ArabicPlayer; number: number; label: string } = $props();

	const available = $derived(player.has(number));
	const active = $derived(player.current === number);
	const playing = $derived(active && player.playing);
</script>

<button
	type="button"
	class="shrink-0 mt-1 rounded-full p-1 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 print:hidden {available
		? ''
		: 'opacity-30'}"
	aria-label={label}
	aria-pressed={playing}
	title={label}
	onclick={() => player.toggle(number)}
>
	<span class="flex w-8 h-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
		{#if playing}<Pause class="w-4 h-4" fill="currentColor" />{:else}<Play class="w-4 h-4 ms-0.5" fill="currentColor" />{/if}
	</span>
</button>
