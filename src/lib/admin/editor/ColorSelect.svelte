<script lang="ts">
	import Baseline from '@lucide/svelte/icons/baseline';
	import { cn } from '#lib/utils.ts';
	import ToolMenu from './ToolMenu.svelte';
	import type { EditorState } from './state.svelte.ts';

	let { s }: { s: EditorState } = $props();

	const COLORS = [
		'#000000',
		'#434343',
		'#666666',
		'#999999',
		'#b7b7b7',
		'#d9d9d9',
		'#efefef',
		'#ffffff',
		'#dc2626',
		'#ea580c',
		'#d97706',
		'#ca8a04',
		'#65a30d',
		'#16a34a',
		'#059669',
		'#0d9488',
		'#0891b2',
		'#0284c7',
		'#2563eb',
		'#4f46e5',
		'#7c3aed',
		'#9333ea',
		'#c026d3',
		'#db2777'
	];

	let open = $state(false);
	const current = $derived(s.attrs('textStyle').color ?? '');

	function apply(color: string) {
		if (color) s.run((e) => e.chain().focus().setColor(color).run());
		else s.run((e) => e.chain().focus().unsetColor().run());
		open = false;
	}
</script>

<ToolMenu title="Text Color" bind:open triggerClass="flex-col justify-center w-7 h-7" popupClass="p-2 w-[184px]">
	{#snippet trigger()}
		<Baseline class="w-3.5 h-3.5" />
		<span class="block w-3.5 h-[3px] rounded-full -mt-0.5" style:background-color={current || 'currentColor'}></span>
	{/snippet}
	<div class="grid grid-cols-8 gap-1 mb-2">
		{#each COLORS as color (color)}
			<button
				type="button"
				title={color}
				aria-label={color}
				onmousedown={(e) => {
					e.preventDefault();
					apply(color);
				}}
				class={cn('w-4.5 h-4.5 rounded-full border border-border/60 transition-transform hover:scale-110', current === color && 'ring-2 ring-offset-1 ring-primary')}
				style:background-color={color}
			></button>
		{/each}
	</div>
	<label class="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted transition-colors cursor-pointer">
		<input
			type="color"
			value={current || '#000000'}
			onchange={(e) => apply(e.currentTarget.value)}
			class="w-4.5 h-4.5 rounded border border-border cursor-pointer bg-transparent p-0"
		/>
		<span class="text-xs text-muted-foreground">Custom</span>
	</label>
	<button
		type="button"
		onmousedown={(e) => {
			e.preventDefault();
			apply('');
		}}
		class="w-full text-left px-1 py-1 mt-0.5 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Reset to default</button
	>
</ToolMenu>
