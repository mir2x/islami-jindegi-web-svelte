<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import ListBrowser from '#lib/components/browser/ListBrowser.svelte';
	import ListRow from '#lib/components/browser/ListRow.svelte';
	import { rowTitle } from '#lib/components/browser/classes.ts';
	import type { InitialList } from '#lib/components/browser/list-state.svelte.ts';
	import ContentBody from '#lib/components/shared/ContentBody.svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import { htmlToText } from '#lib/html.ts';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ArticleDetail, ArticleListItem } from '#lib/types.ts';
	import { ARTICLES } from './config.ts';

	let { initial, authors, categories }: { initial: InitialList<ArticleListItem>; authors: FilterOption[]; categories: FilterOption[] } = $props();
	const t = useT('ArticlesPage');
</script>

<ListBrowser
	cfg={ARTICLES}
	{initial}
	{authors}
	{categories}
	icon={FileText}
	info={(d: ArticleDetail) => ({ title: d.title, share: [d.title, htmlToText(d.body ?? d.excerpt ?? '')].filter(Boolean).join('\n\n') })}
>
	{#snippet row(item: ArticleListItem, ctx)}
		<ListRow {...ctx} icon={FileText}>
			<p class={rowTitle(ctx.selected)}>{item.title}</p>
			{#if item.author}<p class="text-sm text-muted-foreground mt-0.5 truncate">{item.author.name}</p>{/if}
		</ListRow>
	{/snippet}
	{#snippet subtitle(d: ArticleDetail)}
		{#if d.author || d.publishedAt}
			<div class="flex items-center gap-2 mt-1 text-base text-muted-foreground flex-wrap">
				{#if d.author}<span>{d.author.name}</span>{/if}
				{#if d.publishedAt}<span class="tabular-nums">{formatDate(d.publishedAt, currentLocale())}</span>{/if}
			</div>
		{/if}
	{/snippet}
	{#snippet body(d: ArticleDetail)}
		<ContentBody
			html={d.body}
			fallback={d.excerpt ?? t('noDetail')}
			categories={d.categories}
			documentUrl={d.documentUrl}
			title={d.title}
			authorName={d.author?.name}
			pdfLabel={t('downloadPdf')}
		/>
	{/snippet}
</ListBrowser>
