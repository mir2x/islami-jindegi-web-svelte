<script lang="ts">
	import ContentBody from '#lib/components/shared/ContentBody.svelte';
	import ContentDetail from '#lib/components/shared/ContentDetail.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const item = $derived(data.item);
	const t = useT('DuaDetail');
</script>

<ContentDetail
	section="dua"
	id={item.id}
	title={item.title}
	categories={item.categories}
	audioUrl={item.audioUrl}
	audioNs="DuaDetail"
	moreTitle={t('moreItems')}
	more={data.more}
	shareHtml={item.body ?? item.excerpt ?? ''}
>
	<ContentBody page html={item.body} fallback={item.excerpt} />
</ContentDetail>
