<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import MoveHorizontal from '@lucide/svelte/icons/move-horizontal';
	import MoveVertical from '@lucide/svelte/icons/move-vertical';
	import Plus from '@lucide/svelte/icons/plus';
	import { cn } from '#lib/utils.ts';
	import { currentSpacing, setBlockSpacing, type SpacingSpec } from './spacing.ts';
	import ToolMenu from './ToolMenu.svelte';
	import type { EditorState } from './state.svelte.ts';

	let { s, spec }: { s: EditorState; spec: SpacingSpec } = $props();

	let open = $state(false);
	const current = $derived.by(() => {
		void s.tick;
		return s.editor ? currentSpacing(s.editor, spec) : 0;
	});

	function apply(value: number) {
		s.run((e) => setBlockSpacing(e, spec.attr, spec.toCss(value)));
		open = false;
	}

	// Relative, so F4 keeps stepping from wherever the cursor is.
	function step(direction: 1 | -1) {
		s.run((e) => {
			const next = currentSpacing(e, spec) + direction * spec.step;
			setBlockSpacing(e, spec.attr, spec.toCss(Math.min(spec.max, Math.max(spec.min, Math.round(next * 100) / 100))));
		});
	}

	const arrow = 'flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:bg-muted hover:text-foreground';
</script>

<ToolMenu title={spec.title} bind:open triggerClass="gap-0.5 h-7 px-1" popupClass="py-1 min-w-[112px]">
	{#snippet trigger()}
		{#if spec.attr === 'lineHeight'}<MoveVertical class="w-3.5 h-3.5" />{:else}<MoveHorizontal class="w-3.5 h-3.5" />{/if}
		<span class="tabular-nums">{spec.label(current)}</span>
	{/snippet}
	<div class="flex items-center justify-between gap-1 px-1.5 pb-1 mb-1 border-b border-border">
		<button
			type="button"
			title="Decrease"
			aria-label="Decrease"
			onmousedown={(e) => {
				e.preventDefault();
				step(-1);
			}}
			class={arrow}><Minus class="w-3 h-3" /></button
		>
		<span class="text-xs font-semibold tabular-nums">{spec.label(current)}</span>
		<button
			type="button"
			title="Increase"
			aria-label="Increase"
			onmousedown={(e) => {
				e.preventDefault();
				step(1);
			}}
			class={arrow}><Plus class="w-3 h-3" /></button
		>
	</div>
	{#each spec.presets as value (value)}
		<button
			type="button"
			onmousedown={(e) => {
				e.preventDefault();
				apply(value);
			}}
			class={cn('w-full px-3 py-[3px] text-xs text-left hover:bg-muted transition-colors tabular-nums', value === current && 'bg-primary/10 text-primary font-semibold')}
			>{spec.label(value)}</button
		>
	{/each}
	<button
		type="button"
		onmousedown={(e) => {
			e.preventDefault();
			s.run((ed) => setBlockSpacing(ed, spec.attr, null));
			open = false;
		}}
		class="w-full text-left px-3 py-1 mt-0.5 border-t border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Reset to default</button
	>
</ToolMenu>
