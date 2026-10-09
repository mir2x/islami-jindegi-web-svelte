<script lang="ts">
	import ContentBody from '#lib/components/shared/ContentBody.svelte';
	import ContentDetail from '#lib/components/shared/ContentDetail.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const item = $derived(data.item);
	const t = useT('MalfuzatDetail');
</script>

<ContentDetail
	section="malfuzat"
	id={item.id}
	title={item.title}
	author={item.author?.name}
	date={item.publishedAt ?? item.createdAt}
	categories={item.categories}
	audioUrl={item.audioUrl}
	audioNs="MalfuzatDetail"
	moreTitle={t('moreItems')}
	more={data.more}
	shareHtml={item.body ?? item.excerpt ?? ''}
>
	<ContentBody page html={item.body} fallback={item.excerpt} />
</ContentDetail>
