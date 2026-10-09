<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { Chapter, SubChapter } from '#lib/types.ts';
	import ItemActions from './ItemActions.svelte';
	import SubChapterRow from './SubChapterRow.svelte';

	interface Props {
		chapter: Chapter;
		index: number;
		/** "Expand all" from the page header. */
		forceExpanded: boolean;
		bookId: string;
		ondelete: (item: { id: string; title: string; type: 'chapter' | 'subchapter' }) => void;
	}
	let { chapter, index, forceExpanded, bookId, ondelete }: Props = $props();

	const t = useT('BooksAdmin');
	let local = $state(false);
	const expanded = $derived(forceExpanded || local);

	// Top-level subchapters, each with its direct children.
	const tree = $derived.by(() => {
		const children = new Map<string, SubChapter[]>();
		for (const s of chapter.subChapters) {
			if (s.parentSubChapterId) children.set(s.parentSubChapterId, [...(children.get(s.parentSubChapterId) ?? []), s]);
		}
		const top = chapter.subChapters.filter((s) => !s.parentSubChapterId);
		return (top.length > 0 ? top : chapter.subChapters).map((sub) => ({ sub, children: children.get(sub.id) ?? [] }));
	});
</script>

<div class="border border-border rounded-xl overflow-hidden">
	<div class="flex items-center gap-3 px-5 py-4 bg-card hover:bg-muted/30 transition-colors group">
		<button type="button" onclick={() => (local = !local)} class="flex-1 flex items-center gap-3 text-left min-w-0">
			<span class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{index}</span>
			<span class="flex-1 font-semibold text-foreground leading-snug">{chapter.title}</span>
			<div class="flex items-center gap-2 shrink-0">
				{#if chapter.subChapters.length > 0}<span class="text-xs text-muted-foreground">{t('subCount', { count: chapter.subChapters.length })}</span>{/if}
				{#if expanded}<ChevronDown class="w-4 h-4 text-muted-foreground" />{:else}<ChevronRight class="w-4 h-4 text-muted-foreground" />{/if}
			</div>
		</button>
		<ItemActions
			editHref="/admin/chapters/{chapter.id}/edit"
			publicHref="/books/{bookId}?chapter={chapter.id}"
			editTitle={t('editChapterTooltip')}
			deleteTitle={t('deleteChapterTooltip')}
			icon="w-3.5 h-3.5"
			ondelete={() => ondelete({ id: chapter.id, title: chapter.title, type: 'chapter' })}
		/>
	</div>

	{#if expanded}
		<div class="px-5 pb-4 pt-3 border-t border-border bg-card">
			{#if chapter.body}<div class="prose-content mb-4">{@html chapter.body}</div>{/if}
			{#if tree.length > 0}
				<div class="space-y-0.5">
					{#each tree as node (node.sub.id)}<SubChapterRow sub={node.sub} childSubs={node.children} {bookId} chapterId={chapter.id} {ondelete} />{/each}
				</div>
			{/if}
			{#if !chapter.body && chapter.subChapters.length === 0}<p class="text-sm text-muted-foreground italic">{t('noContent')}</p>{/if}
		</div>
	{/if}
</div>
