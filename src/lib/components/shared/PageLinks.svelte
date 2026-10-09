<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		/** Locale-less list path, e.g. `/bayan`. Page 1 links to the bare path, the rest to `?page=N`. */
		basePath: string;
		page: number;
		totalPages: number;
		/** Extra query kept on every link (e.g. an active tab), without `page`. */
		query?: string;
		class?: string;
	}
	let { basePath, page, totalPages, query = '', class: className }: Props = $props();

	const t = useT('Common');
	const href = (p: number) => {
		const params = new URLSearchParams(query);
		if (p > 1) params.set('page', String(p));
		const qs = params.toString();
		return `${localePath(basePath, currentLocale())}${qs ? `?${qs}` : ''}`;
	};

	// First and last page, a window around the current one, and ±10 / ±100 jumps. The jumps keep the
	// whole catalogue within a handful of link hops (307 pages: 8 at most, not 77), which is what
	// lets a crawler reach deep pages.
	const pages = $derived.by(() => {
		const near = [page - 2, page - 1, page, page + 1, page + 2];
		const jumps = [10, 100].flatMap((step) => [page - step, page + step]);
		return [...new Set([1, ...near, ...jumps, totalPages].filter((p) => p >= 1 && p <= totalPages))].sort((a, b) => a - b);
	});

	const item = 'w-8 sm:w-9 h-8 sm:h-9 rounded-lg text-sm font-medium transition-colors shrink-0 flex items-center justify-center';
	const arrow = 'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors shrink-0';
</script>

<!-- Crawlable pager: plain links to `?page=N`, in the server HTML so a crawler can walk the whole catalogue. -->
{#if totalPages > 1}
	<nav aria-label={t('pagination')} class={cn('flex flex-wrap items-center justify-center gap-1 sm:gap-2 py-6', className)}>
		{#if page > 1}
			<a href={href(page - 1)} data-sveltekit-preload-data="off" rel="prev" aria-label={t('previous')} class={arrow}>
				<ChevronLeft class="w-4 h-4" /><span class="hidden sm:inline">{t('previous')}</span>
			</a>
		{/if}
		{#each pages as p, i (p)}
			<span class="flex items-center gap-1">
				{#if i > 0 && p - pages[i - 1] > 1}<span aria-hidden="true" class="px-1 text-muted-foreground">…</span>{/if}
				{#if p === page}
					<span aria-current="page" class={cn(item, 'bg-primary text-primary-foreground')}>{p}</span>
				{:else}
					<a
						href={href(p)}
						data-sveltekit-preload-data="off"
						aria-label={t('pageNumber', { number: p })}
						class={cn(item, 'text-muted-foreground hover:bg-muted hover:text-foreground')}>{p}</a
					>
				{/if}
			</span>
		{/each}
		{#if page < totalPages}
			<a href={href(page + 1)} data-sveltekit-preload-data="off" rel="next" aria-label={t('next')} class={arrow}>
				<span class="hidden sm:inline">{t('next')}</span><ChevronRight class="w-4 h-4" />
			</a>
		{/if}
	</nav>
{/if}
