<script lang="ts">
	import School from '@lucide/svelte/icons/school';
	import PageLinks from '#lib/components/shared/PageLinks.svelte';
	import SearchInput from '#lib/components/shared/SearchInput.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { MadrasahListItem } from '#lib/types.ts';
	import { UrlSearch } from '#lib/url-search.svelte.ts';
	import MadrasahRow from './MadrasahRow.svelte';

	interface Props {
		items: MadrasahListItem[];
		total: number;
		pageNo: number;
		pageSize: number;
		search: string;
	}
	let { items, total, pageNo, pageSize, search }: Props = $props();

	const t = useT('MadrasahPage');
	// svelte-ignore state_referenced_locally
	const urlSearch = new UrlSearch(search);
</script>

<div class="max-w-3xl mx-auto">
	<div class="mb-4"><SearchInput value={urlSearch.text} onchange={urlSearch.set} placeholder={t('searchPlaceholder')} /></div>

	{#if items.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<School class="w-14 h-14 text-muted-foreground/25 mb-4" />
			<p class="text-xl font-medium text-foreground">{t('emptyTitle')}</p>
			{#if search}<button type="button" onclick={() => urlSearch.set('')} class="mt-4 text-base text-primary hover:underline">{t('clearSearch')}</button>{/if}
		</div>
	{:else}
		<div class="space-y-2">
			{#each items as item (item.id)}<MadrasahRow {item} />{/each}
		</div>
	{/if}

	<PageLinks basePath="/madrasah" page={pageNo} totalPages={Math.ceil(total / pageSize)} query={search ? `q=${encodeURIComponent(search)}` : ''} />
</div>
