<script lang="ts" generics="T extends { id: string }, D extends { id: string }">
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import type { Component, Snippet } from 'svelte';
	import { apiGet } from '#lib/client-api.ts';
	import type { FilterOption } from '#lib/filters.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import BrowserToolbar from './BrowserToolbar.svelte';
	import DetailPanel from './DetailPanel.svelte';
	import FilterAside from './FilterAside.svelte';
	import ListBody from './ListBody.svelte';
	import { ListState, type InitialList } from './list-state.svelte.ts';
	import { registerBrowser, restoreScroll } from './snapshot.svelte.ts';
	import type { BrowserConfig, RowContext } from './types.ts';

	type Icon = Component<{ class?: string }>;

	interface Props {
		cfg: BrowserConfig;
		initial: InitialList<T>;
		authors?: FilterOption[];
		categories?: FilterOption[];
		/** Icon for the empty list, the "nothing selected" panel and the text tab. */
		icon: Icon;
		/** Icons of the text / audio tabs (modules with tabs); default to `icon`. */
		textIcon?: Icon;
		audioIcon?: Icon;
		row: Snippet<[item: T, ctx: RowContext]>;
		/** Title and the plain text the Copy button copies, for a loaded detail. */
		info: (detail: D) => { title: string; share: string };
		subtitle?: Snippet<[detail: D]>;
		body: Snippet<[detail: D]>;
		/** Skeleton circle size, matching the module's rows. */
		large?: boolean;
	}
	let { cfg, initial, authors = [], categories = [], icon, textIcon = icon, audioIcon = icon, row, info, subtitle, body, large = false }: Props = $props();

	// `cfg` is a module constant: it never changes for the life of the component.
	// svelte-ignore state_referenced_locally
	const t = useT(cfg.ns);
	const desktop = new MediaQuery('min-width: 1024px', false);

	let scroller = $state<HTMLElement>();
	// svelte-ignore state_referenced_locally
	const list = new ListState<T>(cfg, initial, () => scroller?.scrollTo({ top: 0 }));

	// Nothing chosen yet: default to the first row on desktop (there is a panel to fill); on mobile a tap navigates instead.
	const selectedId = $derived(list.selectedId ?? (desktop.current ? (list.items[0]?.id ?? null) : null));

	let fetched = $state<{ id: string; data: D | null } | null>(null);
	$effect(() => {
		const id = selectedId;
		if (cfg.detail !== 'fetch' || !id) return;
		const ac = new AbortController();
		apiGet<D>(`${cfg.api}/${id}`, ac.signal).then((data) => {
			if (!ac.signal.aborted) fetched = { id, data };
		});
		return () => ac.abort();
	});
	const detail = $derived.by(() => {
		if (cfg.detail === 'item') return (list.items.find((i) => i.id === selectedId) as unknown as D | undefined) ?? null;
		return fetched && fetched.id === selectedId ? fetched.data : null;
	});
	const detailLoading = $derived(cfg.detail === 'fetch' && selectedId !== null && fetched?.id !== selectedId);
	const meta = $derived(detail ? info(detail) : null);

	onMount(() =>
		registerBrowser({
			capture: () => ({ ...list.capture(), scrollTop: scroller?.scrollTop ?? 0, windowY: window.scrollY }),
			restore: async (s) => {
				if (!list.restore(s as never)) return;
				await tick();
				restoreScroll(scroller, s);
			}
		})
	);

	const hrefOf = (id: string) => localePath(`${cfg.basePath}/${id}`, currentLocale());
	function select(id: string) {
		list.select(id);
		if (!desktop.current) void goto(hrefOf(id));
	}
</script>

<div class="flex flex-col lg:flex-row gap-6 lg:items-stretch lg:flex-1 lg:min-h-0">
	<FilterAside {cfg} list={list as ListState<{ id: string }>} {authors} {categories} />

	<!-- Column 2: search, filters, list -->
	<div class="min-w-0 flex flex-col lg:w-[24rem] lg:shrink-0 lg:min-h-0 print:hidden">
		<div class="flex flex-col min-h-0 lg:flex-1 rounded-2xl border border-border bg-card overflow-hidden">
			<BrowserToolbar {cfg} list={list as ListState<{ id: string }>} {authors} {categories} {textIcon} {audioIcon} />
			<ListBody {cfg} list={list as ListState<{ id: string }>} {icon} bind:scroller>
				{#snippet skeleton()}
					<div class="space-y-2">
						{#each Array(8) as _, i (i)}
							<div class="animate-pulse flex items-center gap-4 p-4 rounded-xl border border-border">
								<div class="{large ? 'w-11 h-11' : 'w-10 h-10'} rounded-full bg-muted shrink-0"></div>
								<div class="flex-1 space-y-2">
									<div class="h-4 bg-muted rounded w-3/4"></div>
									<div class="h-3 bg-muted rounded w-1/3"></div>
								</div>
							</div>
						{/each}
					</div>
				{/snippet}
				<div class="space-y-2">
					{#each list.items as item (item.id)}
						{@render row(item, { selected: selectedId === item.id, href: hrefOf(item.id), onselect: () => select(item.id) })}
					{/each}
				</div>
			</ListBody>
		</div>
	</div>

	<!-- Column 3: detail panel (desktop only, and always for print) -->
	<div class="hidden lg:flex print:flex lg:flex-1 lg:min-h-0 print:w-full print:h-auto">
		<DetailPanel
			hasSelection={selectedId !== null}
			loading={detailLoading}
			{icon}
			selectPrompt={t('selectPrompt')}
			detail={meta && detail ? { id: detail.id, ...meta } : null}
			basePath={cfg.basePath}
			subtitle={subtitle && detail ? sub : undefined}
		>
			{#if detail}{@render body(detail)}{/if}
		</DetailPanel>
	</div>
</div>

{#snippet sub()}{#if subtitle && detail}{@render subtitle(detail)}{/if}{/snippet}
