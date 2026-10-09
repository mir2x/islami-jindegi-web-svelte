<script lang="ts">
	import type { BooksTab } from './types.ts';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';

	let { tab, ontab }: { tab: BooksTab; ontab: (tab: BooksTab) => void } = $props();

	const t = useT('BooksAdmin');
	const TABS: { id: BooksTab; key: string }[] = [
		{ id: 'books', key: 'tabBooks' },
		{ id: 'chapters', key: 'tabChapters' },
		{ id: 'subchapters', key: 'tabSubchapters' }
	];
</script>

<div class="flex items-center gap-1 border-b border-border">
	{#each TABS as tb (tb.id)}
		<button
			type="button"
			onclick={() => ontab(tb.id)}
			class={cn(
				'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
				tab === tb.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
			)}>{t(tb.key)}</button
		>
	{/each}
</div>
