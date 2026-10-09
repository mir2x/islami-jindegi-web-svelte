<script lang="ts">
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Modal from '#lib/components/ui/Modal.svelte';
	import type { Chapter } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { triggerCls } from '../ui/classes.ts';
	import TreeNode from './TreeNode.svelte';
	import { childMapOf } from './tree.ts';

	interface Props {
		bookChapters: Chapter[];
		selectedChapterId: string;
		selectedSubId: string | null;
		onselect: (chapterId: string, parentSubChapterId: string | null) => void;
		disabled?: boolean;
		triggerLabel: string;
		title: string;
		/** The subchapter being edited: it and its descendants cannot be chosen as its parent. */
		excludeId?: string;
	}
	let { bookChapters, selectedChapterId, selectedSubId, onselect, disabled, triggerLabel, title, excludeId }: Props = $props();

	let open = $state(false);
	const childMap = $derived(childMapOf(bookChapters));
</script>

<button
	type="button"
	{disabled}
	onclick={() => (open = true)}
	class={cn(triggerCls, 'bg-background disabled:opacity-50', !(selectedChapterId || selectedSubId) && 'text-muted-foreground')}
>
	<span class="truncate">{triggerLabel}</span>
	<ChevronsUpDown class="w-4 h-4 opacity-50 shrink-0 ml-2" />
</button>

<Modal {open} {title} onclose={() => (open = false)} class="max-w-lg">
	<div class="flex-1 overflow-y-auto p-3">
		{#if bookChapters.length === 0}
			<p class="text-center text-muted-foreground py-8">No chapters available</p>
		{:else}
			<div class="space-y-1">
				{#each bookChapters as chapter (chapter.id)}
					<TreeNode
						node={chapter}
						kind="chapter"
						chapterId={chapter.id}
						children={chapter.subChapters.filter((s) => !s.parentSubChapterId)}
						{childMap}
						selected={selectedChapterId === chapter.id && !selectedSubId}
						{selectedSubId}
						{excludeId}
						onselect={(c, s) => {
							onselect(c, s);
							open = false;
						}}
					/>
				{/each}
			</div>
		{/if}
	</div>
</Modal>
