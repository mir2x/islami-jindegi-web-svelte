<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FileText from '@lucide/svelte/icons/file-text';
	import Folder from '@lucide/svelte/icons/folder';
	import { cn } from '#lib/utils.ts';
	import TreeNode from './TreeNode.svelte';
	import type { TreeSub } from './tree.ts';

	interface Props {
		/** A chapter (folder) or a subchapter (file). */
		node: { id: string; title: string };
		kind: 'chapter' | 'sub';
		chapterId: string;
		children: TreeSub[];
		childMap: Map<string, TreeSub[]>;
		selected: boolean;
		selectedSubId: string | null;
		excludeId?: string;
		/** An ancestor is the excluded subchapter, so this one cannot be its own parent either. */
		excluded?: boolean;
		depth?: number;
		onselect: (chapterId: string, subId: string | null) => void;
	}
	let { node, kind, chapterId, children, childMap, selected, selectedSubId, excludeId, excluded = false, depth = 0, onselect }: Props = $props();

	let expanded = $state(false);
	const blocked = $derived(excluded || node.id === excludeId);
</script>

<div class="flex flex-col">
	<div
		class={cn(
			'flex items-center gap-1.5 py-1.5 px-2 rounded-md transition-colors',
			selected ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
			blocked && 'opacity-50 pointer-events-none'
		)}
		style:padding-left="{depth * 1.5 + 0.5}rem"
	>
		<button
			type="button"
			aria-label={expanded ? 'Collapse' : 'Expand'}
			class={cn('p-0.5 rounded-sm hover:bg-black/5 dark:hover:bg-white/10', children.length === 0 && 'invisible')}
			onclick={() => (expanded = !expanded)}
		>
			{#if expanded}<ChevronDown class="w-4 h-4 shrink-0" />{:else}<ChevronRight class="w-4 h-4 shrink-0" />{/if}
		</button>
		<button type="button" class="flex-1 flex items-center gap-2 text-left" onclick={() => !blocked && onselect(chapterId, kind === 'chapter' ? null : node.id)}>
			{#if kind === 'chapter'}<Folder class="w-4 h-4 shrink-0 opacity-70" />{:else}<FileText class="w-4 h-4 shrink-0 opacity-70" />{/if}
			<span class="text-sm leading-tight {kind === 'chapter' ? 'font-semibold' : 'font-medium'}">{node.title}</span>
			{#if selected}<Check class="w-4 h-4 ml-auto" />{/if}
		</button>
	</div>
	{#if expanded && children.length > 0}
		<div class="flex flex-col mt-0.5">
			{#each children as sub (sub.id)}
				<TreeNode
					node={sub}
					kind="sub"
					{chapterId}
					children={childMap.get(sub.id) ?? []}
					{childMap}
					selected={selectedSubId === sub.id}
					{selectedSubId}
					{excludeId}
					excluded={blocked}
					depth={depth + 1}
					{onselect}
				/>
			{/each}
		</div>
	{/if}
</div>
