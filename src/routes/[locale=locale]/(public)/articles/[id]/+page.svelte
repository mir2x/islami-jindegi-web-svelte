<script lang="ts">
	import ContentBody from '#lib/components/shared/ContentBody.svelte';
	import ContentDetail from '#lib/components/shared/ContentDetail.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const item = $derived(data.item);
	const t = useT('ArticleDetail');
</script>

<ContentDetail
	section="articles"
	id={item.id}
	title={item.title}
	author={item.author?.name}
	authorId={item.author?.id}
	date={item.publishedAt ?? item.createdAt}
	categories={item.categories}
	moreTitle={t('moreArticles')}
	more={data.more}
	shareHtml={item.body ?? item.excerpt ?? ''}
>
	<ContentBody page html={item.body} fallback={item.excerpt} documentUrl={item.documentUrl} title={item.title} authorName={item.author?.name} pdfLabel={t('downloadPdf')} />
</ContentDetail>
