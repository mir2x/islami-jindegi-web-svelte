<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Heart from '@lucide/svelte/icons/heart';
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
	import type { DuaDetail, DuaListItem } from '#lib/types.ts';
	import { DUA } from './config.ts';

	let { initial, categories }: { initial: InitialList<DuaListItem>; categories: FilterOption[] } = $props();
	const t = useT('DuaPage');
</script>

<ListBrowser
	cfg={DUA}
	{initial}
	{categories}
	icon={Heart}
	textIcon={BookOpen}
	audioIcon={Volume2}
	info={(d: DuaDetail) => ({ title: d.title, share: [d.title, htmlToText(d.body ?? d.excerpt ?? '')].filter(Boolean).join('\n\n') })}
>
	{#snippet row(item: DuaListItem, ctx)}
		<ListRow {...ctx} icon={item.audioUrl ? Volume2 : Heart}>
			<p class={rowTitle(ctx.selected, 1)}>{item.title}</p>
			{#if item.excerpt}<p class="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.excerpt}</p>{/if}
		</ListRow>
	{/snippet}
	{#snippet body(d: DuaDetail)}
		{#if d.audioUrl}
			<AudioDetail html={d.body} excerpt={d.excerpt} audioUrl={d.audioUrl} ns="DuaPage" categories={d.categories} />
		{:else}
			<ContentBody html={d.body} fallback={d.excerpt ?? t('noDetail')} categories={d.categories} />
		{/if}
	{/snippet}
</ListBrowser>
