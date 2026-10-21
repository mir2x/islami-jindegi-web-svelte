<script lang="ts">
	import ContentDetail from '#lib/components/shared/ContentDetail.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const item = $derived(data.item);
	const t = useT('MasailDetail');
	const tMasail = useT('MasailPage');
	const shareHtml = $derived([`<p>${tMasail('question')}: </p>${item.question}`, item.answer ? `<p>${tMasail('answer')}: </p>${item.answer}` : ''].join(''));
</script>

<ContentDetail
	section="masail"
	id={item.id}
	title={item.title}
	author={item.author?.name}
	authorId={item.author?.id}
	date={item.publishedAt ?? item.createdAt}
	categories={item.categories}
	audioUrl={item.audioUrl}
	audioNs="MasailDetail"
	moreTitle={t('moreItems')}
	more={data.more}
	{shareHtml}
>
	<div class="rounded-lg bg-primary/5 border border-primary/15 p-4 mb-4">
		<p class="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{tMasail('question')}</p>
		<div class="prose-content">{@html item.question}</div>
	</div>
	{#if item.answer}
		<div class="rounded-lg bg-muted/50 border border-border p-4">
			<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{tMasail('answer')}</p>
			<div class="prose-content">{@html item.answer}</div>
		</div>
	{/if}
</ContentDetail>
