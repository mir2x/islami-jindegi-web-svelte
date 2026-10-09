<script lang="ts">
	import Img from '#lib/components/ui/Img.svelte';
	import { currentLocale, localePath } from '#lib/i18n/use-t.svelte.ts';
	import type { TopicEntry } from '#lib/topics.ts';

	/** A topic's item: `card` is the fixed-width tile of the horizontal rows, `row` the full-width list line. */
	let { entry, variant }: { entry: TopicEntry; variant: 'card' | 'row' } = $props();
	const href = $derived(localePath(entry.href, currentLocale()));
	const cover = $derived(entry.coverUrl || '/images/default-book.png');
</script>

{#if variant === 'card' && entry.coverUrl !== undefined}
	<a {href} data-sveltekit-preload-data="off" class="group shrink-0 w-40 snap-start">
		<div class="aspect-[3/4] relative rounded-xl overflow-hidden bg-muted mb-3 shadow-sm group-hover:shadow-md transition-all duration-200">
			<Img src={cover} alt={entry.title} sizes="160px" class="object-cover group-hover:scale-[1.02] transition-transform duration-300" />
		</div>
		<p class="text-[15px] font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">{entry.title}</p>
		{#if entry.subtitle}<p class="text-sm text-muted-foreground mt-1 truncate">{entry.subtitle}</p>{/if}
	</a>
{:else if variant === 'card'}
	<a {href} data-sveltekit-preload-data="off" class="group shrink-0 w-72 snap-start">
		<div class="h-full bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all duration-200">
			<p class="text-base font-semibold leading-snug line-clamp-3 group-hover:text-primary transition-colors">{entry.title}</p>
			{#if entry.subtitle}<p class="text-sm text-muted-foreground mt-2 truncate">{entry.subtitle}</p>{/if}
		</div>
	</a>
{:else}
	<a {href} data-sveltekit-preload-data="off" class="group flex items-start gap-4 py-4 border-b border-border/50 last:border-0">
		{#if entry.coverUrl !== undefined}
			<div class="relative w-14 aspect-[3/4] shrink-0 rounded-md overflow-hidden bg-muted"><Img src={cover} alt={entry.title} sizes="56px" class="object-cover" /></div>
		{/if}
		<div class="flex-1 min-w-0">
			<p class="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{entry.title}</p>
			{#if entry.subtitle}<p class="text-sm text-muted-foreground mt-1 truncate">{entry.subtitle}</p>{/if}
		</div>
	</a>
{/if}
