<script lang="ts">
	import { cn } from '#lib/utils.ts';
	import type { EditorState } from './state.svelte.ts';

	let { s }: { s: EditorState } = $props();

	const SIZES = ['10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24', '28', '32', '36', '48', '72'];
	let open = $state(false);
	let input = $state('');
	let root = $state<HTMLElement>();

	const current = $derived((s.attrs('textStyle').fontSize ?? '').replace('px', ''));

	function apply(size: string) {
		const n = parseInt(size);
		if (n >= 1 && n <= 400) s.run((e) => e.chain().focus().setFontSize(`${n}px`).run());
		open = false;
	}
</script>

<svelte:window onmousedown={(e) => open && root && !root.contains(e.target as Node) && (open = false)} />

<div class="relative" bind:this={root}>
	<div class={cn('flex items-center h-7 border rounded overflow-hidden transition-colors', open ? 'border-primary' : 'border-border')}>
		<input
			type="text"
			aria-label="Font size"
			value={open ? input : current}
			placeholder="—"
			onfocus={() => {
				open = true;
				input = current;
			}}
			oninput={(e) => (input = e.currentTarget.value)}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					apply(input);
				}
				if (e.key === 'Escape') open = false;
			}}
			class="w-9 h-full text-center text-xs bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50"
		/>
	</div>
	{#if open}
		<div class="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[52px] max-h-52 overflow-y-auto">
			{#each SIZES as size (size)}
				<button
					type="button"
					onmousedown={(e) => {
						e.preventDefault();
						apply(size);
					}}
					class={cn('w-full px-3 py-[3px] text-xs text-left hover:bg-muted transition-colors', size === current && 'bg-primary/10 text-primary font-semibold')}>{size}</button
				>
			{/each}
		</div>
	{/if}
</div>
