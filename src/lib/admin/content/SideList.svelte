<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import { tick } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { api, qs } from '../api.ts';
	import { editorTab, withEditorTab } from '../editor-tab.svelte.ts';
	import { inputCls, inp } from '../ui/classes.ts';
	import { recall } from './list-memory.ts';
	import type { ContentConfig } from './types.ts';

	interface Item {
		id: string;
		title: string;
		position?: number | null;
	}
	let { config, currentId }: { config: ContentConfig; currentId: string } = $props();

	// Follows the sort the list was last viewed in, so "next item" means what the editor expects.
	// svelte-ignore state_referenced_locally
	const sort = recall(config.slug, config.defaultSort).sort;
	const tab = editorTab();
	let items = $state<Item[]>([]);
	let loading = $state(true);
	let search = $state('');
	let listEl = $state<HTMLElement>();

	$effect(() => {
		let cancelled = false;
		api
			.get<{ data: Item[] }>(`/api/${config.api}?${qs({ page: 1, pageSize: 5000, sort })}`)
			.then((res) => !cancelled && (items = res.data ?? []))
			.catch((e) => console.error(e))
			.finally(() => !cancelled && (loading = false));
		return () => (cancelled = true);
	});

	const shown = $derived.by(() => {
		const q = search.toLowerCase();
		return q ? items.filter((i) => i.title.toLowerCase().includes(q) || String(i.position).includes(q)) : items;
	});

	// Scroll the open item into view when the list arrives or the item changes.
	let scrolledFor = '';
	$effect(() => {
		void shown.length;
		if (scrolledFor === currentId) return;
		void tick().then(() => {
			const active = listEl?.querySelector('[aria-current="page"]');
			if (!active) return;
			scrolledFor = currentId;
			active.scrollIntoView({ block: 'center' });
		});
	});
</script>

<div class="hidden lg:flex flex-col h-full bg-sidebar border-r border-sidebar-border w-80 shrink-0">
	<div class="p-4 border-b border-sidebar-border sticky top-0 bg-sidebar z-10">
		<div class="relative">
			<Search class="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
			<input placeholder="Search title or position..." bind:value={search} class={inp('pl-8 bg-background')} />
		</div>
	</div>
	<div bind:this={listEl} class="flex-1 overflow-y-auto p-2 space-y-1">
		{#each shown as item (item.id)}
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
		{#if loading}<div class="flex justify-center py-8"><Loader2 class="w-5 h-5 animate-spin text-muted-foreground" /></div>{/if}
		{#if !loading && shown.length === 0}<div class="text-center py-8 text-sm text-muted-foreground">No {config.plural.toLowerCase()} found.</div>{/if}
	</div>
</div>
