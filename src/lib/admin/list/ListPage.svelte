<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import type { Snippet } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Pagination from '../ui/Pagination.svelte';

	interface Props {
		title: string;
		/** Total shown under the title; null while loading. */
		total: number | null;
		/** Replaces the count line under the title. */
		subtitle?: string;
		/** Show the count inline after the title, with no line beneath it. */
		countInTitle?: boolean;
		/** Word after the count, e.g. "entries". */
		unit?: string;
		addHref?: string;
		addLabel?: string;
		page: number;
		totalPages: number;
		onpage: (page: number) => void;
		/** Extra buttons next to "Add". */
		actions?: Snippet;
		filters?: Snippet;
		/** Tab strip between the header and the filters. */
		tabs?: Snippet;
		/** A banner between the header and the filters. */
		notice?: Snippet;
		children: Snippet;
		/** Anything rendered after the table (dialogs). */
		after?: Snippet;
	}
	let {
		title,
		total,
		subtitle,
		countInTitle = false,
		unit = 'entries',
		addHref,
		addLabel,
		page,
		totalPages,
		onpage,
		actions,
		filters,
		tabs,
		notice,
		children,
		after
	}: Props = $props();
</script>

<!-- No inner scroll container: the admin <main> is the only scroller, so the page never shows a nested scrollbar. The pagination sticks to the viewport bottom instead. -->
<div class="min-h-full flex flex-col">
	<div class="shrink-0 px-4 sm:px-8 pt-8 bg-background {tabs ? '' : 'pb-4'}">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">
					{title}{#if countInTitle && total !== null}<span class="ml-2 font-semibold text-muted-foreground">({total.toLocaleString()})</span>{/if}
				</h1>
				{#if !countInTitle || subtitle}
					<p class="mt-1 text-sm text-muted-foreground {subtitle ? 'max-w-2xl' : ''}">
						{#if subtitle}{subtitle}{:else if total !== null}<span class="font-semibold text-foreground">{total.toLocaleString()}</span> {unit}{:else}Loading...{/if}
					</p>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				{@render actions?.()}
				{#if addHref}<Button href={localePath(addHref)} class="gap-2 shadow-sm"><Plus class="w-4 h-4" /> {addLabel}</Button>{/if}
			</div>
		</div>
		{@render notice?.()}
		{@render tabs?.()}
		{#if filters}<div class="flex flex-wrap gap-3 {tabs ? 'py-4' : ''}">{@render filters()}</div>{/if}
	</div>

	<div class="flex-1 px-4 sm:px-8 pb-4">{@render children()}</div>

	{#if totalPages > 1}
		<div class="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-border bg-background/95 px-4 sm:px-8 py-2.5 backdrop-blur-sm">
			<Pagination {page} {totalPages} onchange={onpage} />
		</div>
	{/if}
	{@render after?.()}
</div>
