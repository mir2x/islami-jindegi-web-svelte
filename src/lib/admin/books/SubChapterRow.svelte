<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { SubChapter } from '#lib/types.ts';
	import ItemActions from './ItemActions.svelte';
	import SubChapterRow from './SubChapterRow.svelte';

	interface Props {
		sub: SubChapter;
		childSubs?: SubChapter[];
		depth?: number;
		bookId: string;
		chapterId: string;
		ondelete: (item: { id: string; title: string; type: 'subchapter' }) => void;
	}
	let { sub, childSubs = [], depth = 0, bookId, chapterId, ondelete }: Props = $props();

	const t = useT('BooksAdmin');
	let expanded = $state(false);
</script>

<div class={depth > 0 ? 'border-l-2 border-border/50 ml-4 pl-3' : 'border-l-2 border-border ml-6 pl-4'}>
	<div class="flex items-start gap-2 group">
		<button type="button" onclick={() => (expanded = !expanded)} class="flex-1 flex items-start gap-2.5 py-2.5 text-left min-w-0">
			<span class="mt-0.5 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
				{#if expanded}<ChevronDown class="w-3.5 h-3.5" />{:else}<ChevronRight class="w-3.5 h-3.5" />{/if}
			</span>
			<span class="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-snug">
				{sub.title}{#if childSubs.length > 0}<span class="ml-2 text-xs text-muted-foreground font-normal">({childSubs.length})</span>{/if}
			</span>
		</button>
		<div class="mt-2">
			<ItemActions
				editHref="/admin/subchapters/{sub.id}/edit"
				publicHref="/books/{bookId}?chapter={chapterId}&sub={sub.id}"
				editTitle={t('editSubchapterTooltip')}
				deleteTitle={t('deleteSubchapterTooltip')}
				ondelete={() => ondelete({ id: sub.id, title: sub.title, type: 'subchapter' })}
			/>
		</div>
	</div>
	{#if expanded}
		{#if sub.body}<div class="pb-3 pr-2"><div class="prose-content">{@html sub.body}</div></div>{/if}
		{#if childSubs.length > 0}
			<div class="space-y-0.5">
				{#each childSubs as child (child.id)}<SubChapterRow sub={child} depth={depth + 1} {bookId} {chapterId} {ondelete} />{/each}
			</div>
		{/if}
	{/if}
</div>
