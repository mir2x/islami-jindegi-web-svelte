<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.ts';

	interface Props {
		/** One Tailwind width class per column ('' = flexible); table-fixed keeps widths stable across sorts. */
		widths: string[];
		minWidth?: string;
		/** `table-fixed`: columns keep their widths across sorts and reloads. Off for tables that size to their content. */
		fixed?: boolean;
		/** The header <tr>. */
		head: Snippet;
		/** The body rows. */
		children: Snippet;
		class?: string;
	}
	let { widths, minWidth = 'min-w-[1020px]', fixed = true, head, children, class: className }: Props = $props();
</script>

<div class={cn('bg-card border rounded-xl shadow-sm', className)} style="overflow: clip">
	<div class="overflow-x-auto">
		<table class={cn('w-full', fixed && 'table-fixed', minWidth)}>
			<colgroup
				>{#each widths as w, i (i)}<col class={w} />{/each}</colgroup
			>
			<thead class="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm"><tr class="border-b">{@render head()}</tr></thead>
			<tbody class="divide-y divide-border/60">{@render children()}</tbody>
		</table>
	</div>
</div>
