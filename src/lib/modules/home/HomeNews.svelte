<script lang="ts">
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { NewsListItem } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';

	let { news }: { news: NewsListItem[] } = $props();
	const t = useT('Home');
	const locale = $derived(currentLocale());

	// Ticker: rotate through the headlines, the outgoing one rolling up while the next rolls in from below.
	// `prev` stays null until the first rotation so the initial render is static.
	let idx = $state(0);
	let prev = $state<number | null>(null);
	$effect(() => {
		if (news.length < 2) return;
		const id = setInterval(() => {
			prev = idx;
			idx = (idx + 1) % news.length;
		}, 4000);
		return () => clearInterval(id);
	});
	const current = $derived(news[idx]);
	const headline = 'absolute inset-x-0 top-0 truncate leading-6 lg:leading-7 text-base lg:text-lg font-semibold text-foreground';
</script>

{#if current}
	<a
		href={localePath(`/news/${current.id}`, locale)}
		class="group shrink-0 w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-3.5 rounded-2xl bg-gradient-to-r from-primary/12 to-primary/5 border border-primary/25 shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
	>
		<span class="text-base lg:text-lg font-bold text-primary dark:text-amber-300 whitespace-nowrap shrink-0">{t('latestNews')}</span>
		<span class="relative flex-1 min-w-0 h-6 lg:h-7 overflow-hidden">
			{#if prev !== null && news[prev]}
				{#key prev}<span class={cn(headline, 'animate-ticker-out motion-reduce:hidden')}>{news[prev].title}</span>{/key}
			{/if}
			{#key idx}<span class={cn(headline, 'group-hover:text-primary transition-colors', prev !== null && 'animate-ticker-in motion-reduce:animate-none')}>{current.title}</span
				>{/key}
		</span>
	</a>
{/if}
