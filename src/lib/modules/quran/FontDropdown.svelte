<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { cn } from '#lib/utils.ts';

	let { fonts, activeKey, onkey }: { fonts: { key: string; label: string }[]; activeKey: string; onkey: (key: string) => void } = $props();

	let open = $state(false);
	const active = $derived(fonts.find((f) => f.key === activeKey) ?? fonts[0]);
</script>

<!-- A select-style dropdown whose list opens in place (not as a floating layer, which the scrolling sheet would clip). -->
<div>
	<button
		type="button"
		onclick={() => (open = !open)}
		aria-expanded={open}
		class="w-full h-11 flex items-center justify-between gap-2 px-4 rounded-xl border border-border bg-background/60 text-sm font-medium text-foreground"
	>
		<span class="truncate">{active.label}</span>
		<ChevronDown class={cn('w-4 h-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
	</button>
	{#if open}
		<ul class="mt-2 rounded-xl border border-border bg-background overflow-hidden divide-y divide-border/60">
			{#each fonts as f (f.key)}
				<li>
					<button
						type="button"
						onclick={() => {
							onkey(f.key);
							open = false;
						}}
						class={cn('w-full flex items-center justify-between gap-2 px-4 py-3 text-sm text-left transition-colors hover:bg-muted', f.key === activeKey ? 'text-primary font-semibold' : 'text-foreground')}
					>
						<span class="truncate">{f.label}</span>
						{#if f.key === activeKey}<Check class="w-4 h-4 shrink-0" />{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
