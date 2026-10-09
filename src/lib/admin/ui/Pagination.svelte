<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { cn } from '#lib/utils.ts';

	interface Props {
		page: number;
		totalPages: number;
		onchange: (page: number) => void;
		/** Page numbers shown on each side of the current one. */
		siblings?: number;
	}
	let { page, totalPages, onchange, siblings = 2 }: Props = $props();

	let goTo = $state('');

	const pages = $derived.by(() => {
		if (totalPages <= siblings * 2 + 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
		const left = Math.max(2, page - siblings);
		const right = Math.min(totalPages - 1, page + siblings);
		const out: (number | 'gap')[] = [1];
		if (left > 2) out.push('gap');
		for (let i = left; i <= right; i++) out.push(i);
		if (right < totalPages - 1) out.push('gap');
		out.push(totalPages);
		return out;
	});

	function go() {
		const n = parseInt(goTo, 10);
		if (n >= 1 && n <= totalPages) {
			onchange(n);
			goTo = '';
		}
	}

	const cell = 'flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors';
	const idle = 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted';
</script>

{#if totalPages > 1}
	<div class="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
		<div class="flex items-center gap-1">
			<button
				type="button"
				aria-label="Previous page"
				onclick={() => onchange(page - 1)}
				disabled={page === 1}
				class={cn(cell, idle, 'disabled:opacity-40 disabled:cursor-not-allowed')}><ChevronLeft class="w-4 h-4" /></button
			>
			{#each pages as p, i (i)}
				{#if p === 'gap'}
					<span class="flex items-center justify-center w-9 h-9 text-sm text-muted-foreground select-none">···</span>
				{:else}
					<button
						type="button"
						onclick={() => onchange(p)}
						aria-current={p === page ? 'page' : undefined}
						class={cn(cell, p === page ? 'border-primary bg-primary text-primary-foreground shadow-sm' : idle)}>{p}</button
					>
				{/if}
			{/each}
			<button
				type="button"
				aria-label="Next page"
				onclick={() => onchange(page + 1)}
				disabled={page === totalPages}
				class={cn(cell, idle, 'disabled:opacity-40 disabled:cursor-not-allowed')}><ChevronRight class="w-4 h-4" /></button
			>
		</div>
		<div class="hidden sm:flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
			<span>Go to</span>
			<input
				type="number"
				min={1}
				max={totalPages}
				bind:value={goTo}
				onkeydown={(e) => e.key === 'Enter' && go()}
				placeholder={String(page)}
				class="w-16 h-8 rounded-md border border-border bg-card px-2 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
			/>
			<span>page</span>
			<button type="button" onclick={go} class="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Go</button>
		</div>
	</div>
{/if}
