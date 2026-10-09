<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Mic from '@lucide/svelte/icons/mic';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import ListBrowser from '#lib/components/browser/ListBrowser.svelte';
	import ListRow from '#lib/components/browser/ListRow.svelte';
	import { rowTitle } from '#lib/components/browser/classes.ts';
	import type { InitialList } from '#lib/components/browser/list-state.svelte.ts';
	import AudioDetail from '#lib/components/shared/AudioDetail.svelte';
	import ContentBody from '#lib/components/shared/ContentBody.svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import { htmlToText } from '#lib/html.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { MalfuzatDetail, MalfuzatListItem } from '#lib/types.ts';
	import { MALFUZAT } from './config.ts';

	let { initial, authors, categories }: { initial: InitialList<MalfuzatListItem>; authors: FilterOption[]; categories: FilterOption[] } = $props();
	const t = useT('MalfuzatPage');
</script>

<ListBrowser
	cfg={MALFUZAT}
	{initial}
	{authors}
	{categories}
	icon={BookOpen}
	audioIcon={Volume2}
	info={(d: MalfuzatDetail) => ({ title: d.title, share: [d.title, htmlToText(d.body ?? d.excerpt ?? '')].filter(Boolean).join('\n\n') })}
>
	{#snippet row(item: MalfuzatListItem, ctx)}
		<ListRow {...ctx} icon={item.hasAudio && item.audioUrl ? Mic : BookOpen}>
			<p class={rowTitle(ctx.selected, 1)}>{item.title}</p>
			<p class="text-sm text-muted-foreground mt-0.5 truncate">{item.author.name}</p>
		</ListRow>
	{/snippet}
	{#snippet subtitle(d: MalfuzatDetail)}<p class="text-base text-muted-foreground mt-1">{d.author.name}</p>{/snippet}
	{#snippet body(d: MalfuzatDetail)}
		{#if d.hasAudio && d.audioUrl}
			<AudioDetail html={d.body} excerpt={d.excerpt} audioUrl={d.audioUrl} ns="MalfuzatPage" categories={d.categories} />
		{:else}
			<ContentBody html={d.body} fallback={d.excerpt ?? t('detailNotFound')} categories={d.categories} />
		{/if}
	{/snippet}
</ListBrowser>
