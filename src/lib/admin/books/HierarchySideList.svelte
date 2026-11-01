<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import { onDestroy, tick, untrack } from 'svelte';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ChapterListItem, PagedResult, SubChapterListItem } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { api, qs } from '../api.ts';
	import { editorTab, withEditorTab } from '../editor-tab.svelte.ts';
	import { PagedLoader } from '../list/loader.svelte.ts';
	import Button from '../ui/Button.svelte';
	import { inp } from '../ui/classes.ts';
	import InfiniteSentinel from '../ui/InfiniteSentinel.svelte';

	interface Props {
		bookId: string;
		currentId?: string;
		currentType?: 'chapter' | 'subchapter';
	}
	let { bookId, currentId, currentType }: Props = $props();

	const PAGE_SIZE = 50;
	const t = useT('BooksAdmin');
	const tab = editorTab();
	// Chapters load a page at a time. A chapter's subchapters load when it is opened, and the
	// subchapters matching a search load a page at a time beside the matching chapters.
	const chapters = new PagedLoader<ChapterListItem>('/api/chapters');
	const found = new PagedLoader<SubChapterListItem>('/api/subchapters');
	let chPage = $state(1);
	let foundPage = $state(1);
	let typed = $state('');
	let search = $state('');
	let subsOf = $state<Record<string, SubChapterListItem[]>>({});
	let expanded = $state<Record<string, boolean>>({});
	let listEl = $state<HTMLElement>();
	let timer: ReturnType<typeof setTimeout>;
	onDestroy(() => clearTimeout(timer));
	// Bumped when a chapter or subchapter is saved, so the tree picks up renamed or moved items.
	let version = $state(0);

	const chapterList = $derived(chapters.result?.data ?? []);
	const foundList = $derived(found.result?.data ?? []);
	const searching = $derived(search !== '');
	const moreChapters = $derived(chPage < chapters.totalPages);
	const moreFound = $derived(foundPage < found.totalPages);

	$effect(() => {
		const bump = () => version++;
		window.addEventListener('book-hierarchy:refresh', bump);
		return () => window.removeEventListener('book-hierarchy:refresh', bump);
	});

	$effect(() => {
		void version;
		void chapters.load({ page: chPage, pageSize: PAGE_SIZE, bookId, search, sort: 'position_asc' });
	});
	$effect(() => {
		void version;
		if (search) void found.load({ page: foundPage, pageSize: PAGE_SIZE, bookId, search, sort: 'position_asc' });
	});

	function onsearch(v: string) {
		typed = v;
		clearTimeout(timer);
		timer = setTimeout(() => {
			search = v.trim();
			chPage = 1;
			foundPage = 1;
		}, 250);
	}

	// A chapter's subchapters, all levels, fetched once and shared by whoever asks.
	const pending = new Map<string, Promise<void>>();
	function ensureSubs(chapterId: string, force = false): Promise<void> {
		if (!force && chapterId in subsOf) return Promise.resolve();
		const running = pending.get(chapterId);
		if (running && !force) return running;
		const job = (async () => {
			try {
				const all: SubChapterListItem[] = [];
				for (let page = 1; ; page++) {
					const res = await api.get<PagedResult<SubChapterListItem>>(`/api/subchapters?${qs({ chapterId, page, pageSize: 100, sort: 'position_asc' })}`);
					all.push(...(res.data ?? []));
					if (all.length >= res.total || !res.data?.length) break;
				}
				subsOf[chapterId] = all;
			} catch (e) {
				console.error(e);
			} finally {
				pending.delete(chapterId);
			}
		})();
		pending.set(chapterId, job);
		return job;
	}

	// Opening a chapter fetches its subchapters.
	$effect(() => {
		for (const [id, open] of Object.entries(expanded)) if (open) untrack(() => void ensureSubs(id));
	});
	// After a save, the chapters already opened are fetched again.
	$effect(() => {
		if (version === 0) return;
		untrack(() => Object.keys(subsOf).forEach((id) => void ensureSubs(id, true)));
	});

	// Open the path down to the item being edited.
	let revealed = '';
	let revealDone = $state(false);
	$effect(() => {
		const id = currentId;
		const type = currentType;
		if (!id || revealed === id) return;
		revealed = id;
		revealDone = false;
		untrack(() => void reveal(id, type));
	});
	async function reveal(id: string, type?: 'chapter' | 'subchapter') {
		try {
			if (type !== 'subchapter') {
				expanded[id] = true;
				return;
			}
			const sub = await api.get<{ chapterId: string }>(`/api/subchapters/${id}/admin`);
			expanded[sub.chapterId] = true;
			await ensureSubs(sub.chapterId);
			const subs = subsOf[sub.chapterId] ?? [];
			for (let s = subs.find((x) => x.id === id); s?.parentSubChapterId; s = subs.find((x) => x.id === s!.parentSubChapterId)) expanded[s.parentSubChapterId] = true;
		} catch (e) {
			console.error(e);
		} finally {
			revealDone = true;
		}
	}

	// Scroll to the open item. Its chapter may be on a later page, so until it shows up (and while
	// not searching) the next page of chapters is fetched.
	let scrolledFor = '';
	$effect(() => {
		void chapterList.length;
		void Object.keys(subsOf).length;
		void revealDone;
		if (!currentId || scrolledFor === currentId || !revealDone) return;
		void tick().then(() => {
			const active = listEl?.querySelector('[aria-current="page"]');
			if (active) {
				scrolledFor = currentId;
				active.scrollIntoView({ block: 'center' });
			} else if (!search && moreChapters && !chapters.loading) chPage += 1;
		});
	});

	const childrenOf = (parentId: string | null, chapterId: string) =>
		(subsOf[chapterId] ?? []).filter((s) => (parentId ? s.parentSubChapterId === parentId : !s.parentSubChapterId));
	const hasKids = (sub: SubChapterListItem) => (subsOf[sub.chapterId] ?? []).some((s) => s.parentSubChapterId === sub.id);
	const toggle = (id: string, e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		expanded[id] = !expanded[id];
	};
	// Opens the new-subchapter form with this chapter (and optionally subchapter) preselected as the parent.
	const addUnder = (chapterId: string, parentId: string | null, e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const qs = new URLSearchParams({ bookId, chapterId, ...(parentId ? { parentSubChapterId: parentId } : {}) });
		void goto(localePath(`/admin/subchapters/new?${qs}`));
	};
	const plusCls =
		'shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring';
	const link = (kind: 'chapters' | 'subchapters', id: string) => withEditorTab(localePath(`/admin/${kind}/${id}/edit`), tab.current);
</script>

{#snippet subTree(parentId: string | null, chapterId: string, depth: number)}
	<div class="space-y-0.5">
		{#each childrenOf(parentId, chapterId) as sub (sub.id)}
			{@const active = currentType === 'subchapter' && currentId === sub.id}
			{@const kids = hasKids(sub)}
			{@const open = !!expanded[sub.id]}
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
					<button type="button" title={t('addSubchapter')} aria-label={t('addSubchapter')} onclick={(e) => addUnder(chapterId, sub.id, e)} class={plusCls}
						><Plus class="w-3.5 h-3.5" /></button
					>
				</a>
				{#if open}{@render subTree(sub.id, chapterId, depth + 1)}{/if}
			</div>
		{/each}
	</div>
{/snippet}

<div class="hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border w-80 shrink-0">
	<div class="p-4 border-b border-sidebar-border sticky top-0 bg-sidebar z-10 space-y-3">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1"><BookOpen class="w-4 h-4" /><span>Book Hierarchy</span></div>
		<div class="grid grid-cols-2 gap-2">
			<Button variant="outline" size="sm" href={localePath(`/admin/chapters/new?bookId=${bookId}`)} class="gap-1 text-xs"><Plus class="w-3.5 h-3.5" /> {t('addChapter')}</Button>
			<Button variant="outline" size="sm" href={localePath(`/admin/subchapters/new?bookId=${bookId}`)} class="gap-1 text-xs"
				><Plus class="w-3.5 h-3.5" /> {t('addSubchapter')}</Button
			>
		</div>
		<div class="relative">
			<Search class="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
			<input placeholder="Search title..." value={typed} oninput={(e) => onsearch(e.currentTarget.value)} class={inp('pl-8 bg-background')} />
		</div>
	</div>
	<div bind:this={listEl} class="flex-1 overflow-y-auto p-2 space-y-1">
		{#if chapters.loading && chapterList.length === 0}
			<div class="flex justify-center py-8"><Loader2 class="w-5 h-5 animate-spin text-muted-foreground" /></div>
		{:else if searching}
			{#each chapterList as chapter (chapter.id)}
				<a
					href={link('chapters', chapter.id)}
					data-sveltekit-replacestate
					aria-current={currentType === 'chapter' && currentId === chapter.id ? 'page' : undefined}
					class={cn(
						'flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors',
						currentType === 'chapter' && currentId === chapter.id
							? 'bg-primary text-primary-foreground font-medium shadow-sm'
							: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					)}
				>
					<span class="text-xs font-bold shrink-0 opacity-80">{chapter.position}.</span>
					<span class="line-clamp-2 leading-tight">{chapter.title}</span>
				</a>
			{/each}
			<InfiniteSentinel hasMore={moreChapters} loading={chapters.loading} onmore={() => (chPage += 1)} />
			{#each foundList as sub (sub.id)}
				<a
					href={link('subchapters', sub.id)}
					data-sveltekit-replacestate
					aria-current={currentType === 'subchapter' && currentId === sub.id ? 'page' : undefined}
					class={cn(
						'flex items-center gap-2 pl-5 pr-2 py-1.5 rounded-md text-sm transition-colors',
						currentType === 'subchapter' && currentId === sub.id
							? 'bg-primary/10 text-primary font-medium'
							: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					)}
				>
					<span class="text-xs font-mono shrink-0 opacity-70">{sub.position}.</span>
					<span class="line-clamp-2 leading-tight">{sub.title}</span>
				</a>
			{/each}
			<InfiniteSentinel hasMore={moreFound} loading={found.loading} onmore={() => (foundPage += 1)} />
			{#if !chapters.loading && !found.loading && chapterList.length === 0 && foundList.length === 0}<div class="text-center py-8 text-sm text-muted-foreground">
					No hierarchy found.
				</div>{/if}
		{:else}
			{#each chapterList as chapter (chapter.id)}
				{@const active = currentType === 'chapter' && currentId === chapter.id}
				{@const kids = chapter.subChapterCount > 0}
				{@const open = !!expanded[chapter.id]}
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
						<button type="button" title={t('addSubchapter')} aria-label={t('addSubchapter')} onclick={(e) => addUnder(chapter.id, null, e)} class={plusCls}
							><Plus class="w-3.5 h-3.5" /></button
						>
					</a>
					{#if open}
						<div class="mt-0.5">
							{#if !(chapter.id in subsOf)}<div class="flex justify-center py-2"><Loader2 class="w-4 h-4 animate-spin text-muted-foreground" /></div>{:else}{@render subTree(
									null,
									chapter.id,
									1
								)}{/if}
						</div>
					{/if}
				</div>
			{/each}
			<InfiniteSentinel hasMore={moreChapters} loading={chapters.loading} onmore={() => (chPage += 1)} />
			{#if !chapters.loading && chapterList.length === 0}<div class="text-center py-8 text-sm text-muted-foreground">No hierarchy found.</div>{/if}
		{/if}
	</div>
</div>
