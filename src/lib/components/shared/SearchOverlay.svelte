<script lang="ts" generics="Hit">
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import { apiGet } from '#lib/client-api.ts';
	import Overlay from '#lib/components/ui/Overlay.svelte';
	import type { Translator } from '#lib/i18n/index.ts';
	import type { PagedResult } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';

	interface Props {
		onclose: () => void;
		/** API path of one page of results. */
		path: (query: string, page: number) => string;
		/** Message keys: placeholder, searchError, noResults, hint, resultCount, loadMore, loadingMore, searching. */
		t: Translator;
		hitKey: (hit: Hit) => string | number;
		/** Changing this re-runs the current search (e.g. when a scope toggle flips). */
		scope?: unknown;
		/** Rendered between the search box and the results (scope toggles). */
		toolbar?: Snippet;
		/** One result; `query` is for highlighting. */
		hit: Snippet<[hit: Hit, query: string]>;
	}
	let { onclose, path, t, hitKey, scope, toolbar, hit }: Props = $props();

	const n = useNum();
	let query = $state('');
	let result = $state<PagedResult<Hit> | null>(null);
	let loading = $state(false);
	let error = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	let seq = 0;
	const hasMore = $derived(result ? result.page * result.pageSize < result.total : false);

	async function run(q: string, page: number) {
		if (!q.trim()) return void ((result = null), (loading = false));
		const mine = ++seq;
		loading = true;
		error = false;
		const res = await apiGet<PagedResult<Hit>>(path(q, page));
		if (mine !== seq) return;
		if (res) result = page === 1 || !result ? res : { ...res, data: [...result.data, ...res.data] };
		else error = true;
		loading = false;
	}
	function onInput(value: string) {
		query = value;
		clearTimeout(timer);
		timer = setTimeout(() => run(value, 1), 350);
	}
	// A scope change re-runs right away (the first run, on mount, has an empty query and does nothing).
	// svelte-ignore state_referenced_locally
	let seenScope = scope;
	$effect(() => {
		if (scope === seenScope) return;
		seenScope = scope;
		void run(query, 1);
	});
	const focus = (el: HTMLElement) => el.focus();
</script>

<Overlay {onclose} align="top" label={t('placeholder')} class="w-full sm:max-w-2xl sm:mt-16 sm:mx-4 h-full sm:h-auto sm:max-h-[80vh] sm:rounded-2xl">
	<div class="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border">
		<Search class="w-4 h-4 text-muted-foreground shrink-0" />
		<input
			use:focus
			value={query}
			oninput={(e) => onInput(e.currentTarget.value)}
			placeholder={t('placeholder')}
			class="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
		/>
		<button
			type="button"
			onclick={onclose}
			aria-label="Close"
			class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
			><X class="w-4 h-4" /></button
		>
	</div>
	{#if toolbar}{@render toolbar()}{/if}

	<div class="flex-1 overflow-y-auto">
		{#if error}<p class="text-center text-sm text-destructive py-12">{t('searchError')}</p>{/if}
		{#if !error && !loading && query.trim() && result && result.data.length === 0}<p class="text-center text-sm text-muted-foreground py-12">{t('noResults')}</p>{/if}
		{#if !error && !query.trim()}<p class="text-center text-sm text-muted-foreground py-12">{t('hint')}</p>{/if}

		{#if result && result.data.length > 0}
			<p class="px-4 pt-3 pb-1 text-xs text-muted-foreground">{t('resultCount', { count: n(result.total) })}</p>
			{#each result.data as h (hitKey(h))}{@render hit(h, query.trim())}{/each}
			{#if hasMore}
				<div class="p-4 text-center">
					<button
						type="button"
						onclick={() => result && run(query, result.page + 1)}
						disabled={loading}
						class="px-4 py-2 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/70 transition-colors disabled:opacity-50"
						>{loading ? t('loadingMore') : t('loadMore')}</button
					>
				</div>
			{/if}
		{/if}

		{#if loading && (!result || result.page === 1)}
			<div class="flex items-center justify-center gap-2 py-12 text-muted-foreground">
				<Loader2 class="w-4 h-4 animate-spin" />
				<p class="text-sm">{t('searching')}</p>
			</div>
		{/if}
	</div>
</Overlay>
