<script lang="ts">
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Mic from '@lucide/svelte/icons/mic';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import ListBrowser from '#lib/components/browser/ListBrowser.svelte';
	import ListRow from '#lib/components/browser/ListRow.svelte';
	import { rowTitle } from '#lib/components/browser/classes.ts';
	import type { InitialList } from '#lib/components/browser/list-state.svelte.ts';
	import AudioDetail from '#lib/components/shared/AudioDetail.svelte';
	import CategoryChips from '#lib/components/shared/CategoryChips.svelte';
	import type { FilterOption } from '#lib/filters.ts';
	import { htmlToText } from '#lib/html.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { MasailDetail, MasailListItem } from '#lib/types.ts';
	import { MASAIL } from './config.ts';

	let { initial, authors, categories }: { initial: InitialList<MasailListItem>; authors: FilterOption[]; categories: FilterOption[] } = $props();
	const t = useT('MasailPage');

	const share = (d: MasailDetail) =>
		[d.title, `${t('question')}: ${htmlToText(d.question)}`, d.answer ? `${t('answer')}: ${htmlToText(d.answer)}` : null].filter(Boolean).join('\n\n');
</script>

<ListBrowser cfg={MASAIL} {initial} {authors} {categories} icon={CircleHelp} audioIcon={Volume2} info={(d: MasailDetail) => ({ title: d.title, share: share(d) })}>
	{#snippet row(item: MasailListItem, ctx)}
		<ListRow {...ctx} icon={item.hasAudio && item.audioUrl ? Mic : CircleHelp}>
			<p class={rowTitle(ctx.selected)}>{item.title}</p>
			{#if item.author}<p class="text-sm text-muted-foreground mt-0.5 truncate">{item.author.name}</p>{/if}
		</ListRow>
	{/snippet}
	{#snippet subtitle(d: MasailDetail)}{#if d.author}<p class="text-base text-muted-foreground mt-1">{d.author.name}</p>{/if}{/snippet}
	{#snippet body(d: MasailDetail)}
		{#if d.hasAudio && d.audioUrl}
			<AudioDetail html={d.question} audioUrl={d.audioUrl} ns="MasailPage" categories={d.categories} />
		{:else}
			<div class="space-y-4">
				<div class="rounded-lg bg-primary/5 border border-primary/15 p-4">
					<p class="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{t('question')}</p>
					<div class="prose-content text-base text-foreground leading-relaxed">{@html d.question}</div>
				</div>
				{#if d.answer}
					<div class="rounded-lg bg-muted/50 border border-border p-4">
						<p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('answer')}</p>
						<div class="prose-content text-base text-foreground leading-relaxed">{@html d.answer}</div>
					</div>
				{/if}
				<CategoryChips categories={d.categories} class="pt-2" />
			</div>
		{/if}
	{/snippet}
</ListBrowser>
