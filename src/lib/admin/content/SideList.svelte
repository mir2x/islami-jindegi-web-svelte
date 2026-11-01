<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import { onDestroy, tick } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { editorTab, withEditorTab } from '../editor-tab.svelte.ts';
	import { PagedLoader } from '../list/loader.svelte.ts';
	import { inputCls, inp } from '../ui/classes.ts';
	import InfiniteSentinel from '../ui/InfiniteSentinel.svelte';
	import { recall } from './list-memory.ts';
	import type { ContentConfig } from './types.ts';

	interface Item {
		id: string;
		title: string;
		position?: number | null;
	}
	let { config, currentId }: { config: ContentConfig; currentId: string } = $props();

	const PAGE_SIZE = 50;
	// Follows the sort the list was last viewed in, so "next item" means what the editor expects.
	// svelte-ignore state_referenced_locally
	const sort = recall(config.slug, config.defaultSort).sort;
	const tab = editorTab();
	// svelte-ignore state_referenced_locally
	const loader = new PagedLoader<Item>(`/api/${config.api}`);
	let page = $state(1);
	let typed = $state('');
	let search = $state('');
	let listEl = $state<HTMLElement>();
	let timer: ReturnType<typeof setTimeout>;
	onDestroy(() => clearTimeout(timer));

	const items = $derived(loader.result?.data ?? []);
	const hasMore = $derived(page < loader.totalPages);

	$effect(() => {
		void loader.load({ page, pageSize: PAGE_SIZE, search, sort });
	});

	function onsearch(v: string) {
		typed = v;
		clearTimeout(timer);
		timer = setTimeout(() => ((search = v.trim()), (page = 1)), 250);
	}

	// Scroll the open item into view once it is loaded. It may be deep in the list, so until it shows
	// up (and while not searching) the next page is fetched.
	let scrolledFor = '';
	$effect(() => {
		void items.length;
		if (scrolledFor === currentId) return;
		void tick().then(() => {
			const active = listEl?.querySelector('[aria-current="page"]');
			if (active) {
				scrolledFor = currentId;
				active.scrollIntoView({ block: 'center' });
			} else if (!search && hasMore && !loader.loading) {
				page += 1;
			}
		});
	});
</script>

<div class="hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border w-80 shrink-0">
	<div class="p-4 border-b border-sidebar-border sticky top-0 bg-sidebar z-10">
		<div class="relative">
			<Search class="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
			<input placeholder="Search title or position..." value={typed} oninput={(e) => onsearch(e.currentTarget.value)} class={inp('pl-8 bg-background')} />
		</div>
	</div>
	<div bind:this={listEl} class="flex-1 overflow-y-auto p-2 space-y-1">
		{#each items as item (item.id)}
			{@const active = item.id === currentId}
			<!-- content-visibility keeps a few thousand rows cheap: off-screen links are not laid out or painted. -->
			<a
				aria-current={active ? 'page' : undefined}
				href={withEditorTab(localePath(`/admin/${config.slug}/${item.id}/edit`), tab.current)}
				data-sveltekit-replacestate
				class={cn(
					'block px-3 py-2.5 rounded-md text-sm transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_44px]',
					active ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
				)}
			>
				<div class="flex items-start gap-2">
					<span class="text-xs font-mono mt-0.5 shrink-0 opacity-70">#{item.position}</span>
					<span class="line-clamp-2 leading-tight">{item.title}</span>
				</div>
			</a>
		{/each}
		{#if loader.loading && items.length === 0}<div class="flex justify-center py-8"><Loader2 class="w-5 h-5 animate-spin text-muted-foreground" /></div>{/if}
		<InfiniteSentinel {hasMore} loading={loader.loading} onmore={() => (page += 1)} />
		{#if !loader.loading && items.length === 0}<div class="text-center py-8 text-sm text-muted-foreground">No {config.plural.toLowerCase()} found.</div>{/if}
	</div>
</div>
