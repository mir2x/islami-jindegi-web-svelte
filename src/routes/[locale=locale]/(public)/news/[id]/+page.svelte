<script lang="ts">
	import ContentBody from '#lib/components/shared/ContentBody.svelte';
	import ContentDetail from '#lib/components/shared/ContentDetail.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const item = $derived(data.item);
	const t = useT('NewsDetail');
</script>

<ContentDetail
	section="news"
	id={item.id}
	title={item.title}
	date={item.publishedAt ?? item.createdAt}
	categories={[]}
	moreTitle={t('moreNews')}
	more={data.more}
	moreDates
	shareHtml={item.body ?? item.excerpt ?? ''}
>
	<ContentBody page html={item.body} fallback={item.excerpt} />
</ContentDetail>
