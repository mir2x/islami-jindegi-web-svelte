<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import { tick, untrack } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import type { ChapterListItem, PagedResult, SubChapterListItem } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { api } from '../api.ts';
	import { editorTab, withEditorTab } from '../editor-tab.svelte.ts';
	import { inputCls, inp } from '../ui/classes.ts';

	interface Props {
		bookId: string;
		currentId: string;
		currentType: 'chapter' | 'subchapter';
	}
	let { bookId, currentId, currentType }: Props = $props();

	const tab = editorTab();
	let chapters = $state<ChapterListItem[]>([]);
	let subs = $state<SubChapterListItem[]>([]);
	let loading = $state(true);
	let search = $state('');
	let expanded = $state<Record<string, boolean>>({});
	let listEl = $state<HTMLElement>();

	$effect(() => {
		const id = bookId;
		let cancelled = false;
		Promise.all([
			api.get<PagedResult<ChapterListItem>>(`/api/chapters?bookId=${id}&pageSize=5000&sort=position_asc`),
			api.get<PagedResult<SubChapterListItem>>(`/api/subchapters?bookId=${id}&pageSize=5000&sort=position_asc`)
		])
			.then(([ch, sb]) => {
				if (cancelled) return;
				chapters = ch.data ?? [];
				subs = sb.data ?? [];
			})
			.catch((e) => console.error(e))
			.finally(() => !cancelled && (loading = false));
		return () => (cancelled = true);
	});

	// Open the path down to the item being edited.
	$effect(() => {
		if (subs.length === 0 && chapters.length === 0) return;
		const open: Record<string, boolean> = {};
		if (currentType === 'chapter') open[currentId] = true;
		else {
			for (let s = subs.find((x) => x.id === currentId); s; s = s.parentSubChapterId ? subs.find((x) => x.id === s!.parentSubChapterId) : undefined) {
				open[s.id] = true;
				if (!s.parentSubChapterId) open[s.chapterId] = true;
			}
		}
		untrack(() => Object.assign(expanded, open));
		void tick().then(() => listEl?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'center' }));
	});

	const q = $derived(search.toLowerCase());
	const searching = $derived(q !== '');
	const matches = (title: string, pos: number) => title.toLowerCase().includes(q) || String(pos).includes(search);
	const childrenOf = (parentId: string | null, chapterId: string) =>
		subs.filter((s) => (parentId ? s.parentSubChapterId === parentId : s.chapterId === chapterId && !s.parentSubChapterId));
	// A branch shows when it or anything beneath it matches the search.
	const subtreeMatches = (sub: SubChapterListItem): boolean => matches(sub.title, sub.position) || subs.some((s) => s.parentSubChapterId === sub.id && subtreeMatches(s));
	const chapterMatches = (c: ChapterListItem) => matches(c.title, c.position) || subs.some((s) => s.chapterId === c.id && matches(s.title, s.position));
	const toggle = (id: string, e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		expanded[id] = !expanded[id];
	};
	const link = (kind: 'chapters' | 'subchapters', id: string) => withEditorTab(localePath(`/admin/${kind}/${id}/edit`), tab.current);
</script>

{#snippet subTree(parentId: string | null, chapterId: string, depth: number)}
	<div class="space-y-0.5">
		{#each childrenOf(parentId, chapterId) as sub (sub.id)}
			{#if !searching || subtreeMatches(sub)}
				{@const active = currentType === 'subchapter' && currentId === sub.id}
				{@const kids = subs.some((s) => s.parentSubChapterId === sub.id)}
				{@const open = !!expanded[sub.id] || searching}
				<div class="w-full">
					<a
						href={link('subchapters', sub.id)}
						data-sveltekit-replacestate
						aria-current={active ? 'page' : undefined}
						class={cn(
							'flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors w-full group',
							active ? 'bg-primary/10 text-primary font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
						)}
						style:padding-left="{depth * 16 + 8}px"
					>
						{#if kids}
							<button type="button" aria-label="Toggle" onclick={(e) => toggle(sub.id, e)} class="shrink-0 p-0.5 rounded-sm hover:bg-black/5 opacity-50 group-hover:opacity-100"
								>{#if open}<ChevronDown class="w-3.5 h-3.5" />{:else}<ChevronRight class="w-3.5 h-3.5" />{/if}</button
							>
						{:else}<div class="w-4.5"></div>{/if}
						<span class="text-xs font-mono shrink-0 opacity-70">{sub.position}.</span>
						<span class="line-clamp-2 leading-tight flex-1">{sub.title}</span>
					</a>
					{#if open}{@render subTree(sub.id, chapterId, depth + 1)}{/if}
				</div>
			{/if}
		{/each}
	</div>
{/snippet}

<div class="hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border w-80 shrink-0">
	<div class="p-4 border-b border-sidebar-border sticky top-0 bg-sidebar z-10 space-y-3">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1"><BookOpen class="w-4 h-4" /><span>Book Hierarchy</span></div>
		<div class="relative">
			<Search class="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
			<input placeholder="Search title or position..." bind:value={search} class={inp('pl-8 bg-background')} />
		</div>
	</div>
	<div bind:this={listEl} class="flex-1 overflow-y-auto p-2 space-y-1">
		{#if loading}
			<div class="flex justify-center py-8"><Loader2 class="w-5 h-5 animate-spin text-muted-foreground" /></div>
		{:else}
			{#each chapters as chapter (chapter.id)}
				{#if !searching || chapterMatches(chapter)}
					{@const active = currentType === 'chapter' && currentId === chapter.id}
					{@const kids = subs.some((s) => s.chapterId === chapter.id && !s.parentSubChapterId)}
					{@const open = !!expanded[chapter.id] || searching}
					<div class="w-full">
						<a
							href={link('chapters', chapter.id)}
							data-sveltekit-replacestate
							aria-current={active ? 'page' : undefined}
							class={cn(
								'flex items-center gap-1 px-2 py-2 rounded-md text-sm transition-colors group',
								active ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
							)}
						>
							{#if kids}
								<button
									type="button"
									aria-label="Toggle"
									onclick={(e) => toggle(chapter.id, e)}
									class="shrink-0 p-0.5 rounded-sm hover:bg-black/10 opacity-70 group-hover:opacity-100"
									>{#if open}<ChevronDown class="w-4 h-4" />{:else}<ChevronRight class="w-4 h-4" />{/if}</button
								>
							{:else}<div class="w-5"></div>{/if}
							<span class="text-xs font-bold shrink-0 opacity-80">{chapter.position}.</span>
							<span class="line-clamp-2 leading-tight flex-1">{chapter.title}</span>
						</a>
						{#if open}<div class="mt-0.5">{@render subTree(null, chapter.id, 1)}</div>{/if}
					</div>
				{/if}
			{/each}
			{#if chapters.length === 0}<div class="text-center py-8 text-sm text-muted-foreground">No hierarchy found.</div>{/if}
		{/if}
	</div>
</div>
