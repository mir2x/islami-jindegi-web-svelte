<script lang="ts">
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import PageLinks from '#lib/components/shared/PageLinks.svelte';
	import SearchInput from '#lib/components/shared/SearchInput.svelte';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { NewsListItem } from '#lib/types.ts';
	import { UrlSearch } from '#lib/url-search.svelte.ts';

	interface Props {
		items: NewsListItem[];
		total: number;
		pageNo: number;
		pageSize: number;
		search: string;
	}
	let { items, total, pageNo, pageSize, search }: Props = $props();

	const t = useT('NewsPage');
	const locale = $derived(currentLocale());
	// svelte-ignore state_referenced_locally
	const urlSearch = new UrlSearch(search);
</script>

<div class="max-w-3xl mx-auto">
	<div class="mb-4"><SearchInput value={urlSearch.text} onchange={urlSearch.set} placeholder={t('searchPlaceholder')} /></div>

	{#if items.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<Newspaper class="w-14 h-14 text-muted-foreground/25 mb-4" />
			<p class="text-xl font-medium text-foreground">{t('emptyTitle')}</p>
			{#if search}<button type="button" onclick={() => urlSearch.set('')} class="mt-4 text-base text-primary hover:underline">{t('clearSearch')}</button>{/if}
		</div>
	{:else}
		<div class="space-y-2">
			{#each items as item (item.id)}
				<a
					href={localePath(`/news/${item.id}`, locale)}
					class="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/3 transition-colors"
				>
					<div
						class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
					>
						<Newspaper class="w-4.5 h-4.5" />
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[17px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
						{#if item.publishedAt}<p class="text-sm text-muted-foreground mt-0.5 tabular-nums">{formatDate(item.publishedAt, locale)}</p>{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}

	<PageLinks basePath="/news" page={pageNo} totalPages={Math.ceil(total / pageSize)} query={search ? `q=${encodeURIComponent(search)}` : ''} />
</div>
