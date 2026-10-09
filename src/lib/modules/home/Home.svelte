<script lang="ts">
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';
	import type { ArticleListItem, BayanListItem, Book, MalfuzatListItem, NewsListItem } from '#lib/types.ts';
	import HomeNews from './HomeNews.svelte';
	import HomePrayerCard from './HomePrayerCard.svelte';
	import HomeSections from './HomeSections.svelte';
	import HomeTabs from './HomeTabs.svelte';

	interface Props {
		books: { data: Book[]; total: number };
		bayans: { data: BayanListItem[]; total: number };
		malfuzat: { data: MalfuzatListItem[]; total: number };
		articles: { data: ArticleListItem[]; total: number };
		news: NewsListItem[];
	}
	let { books, bayans, malfuzat, articles, news }: Props = $props();
	const locale = $derived(currentLocale());
</script>

<div class="flex flex-col bg-background min-h-[calc(100dvh-68px)] tall:h-[calc(100dvh-68px)] tall:justify-center overflow-y-auto tall:lg:overflow-hidden">
	<h1 class="sr-only">{locale === 'bn' ? 'ইসলামী যিন্দেগী — দ্বীনি ইলম ও আমলের নির্ভরযোগ্য মাধ্যম' : 'Islami Jindegi — A guiding light for Islamic living'}</h1>

	<!-- Stacked on mobile, side by side on desktop. Capped at 1920×1200 and centred so 4K/ultra-wide
	     screens get the same composition as a full-HD desktop instead of stretched tiles. -->
	<div class="tall:flex-1 tall:min-h-0 tall:max-h-[75rem] w-full max-w-[120rem] mx-auto flex flex-col lg:flex-row lg:gap-4 lg:p-4">
		<div
			class="w-full tall:flex-1 tall:min-h-0 lg:flex-none lg:w-[50%] lg:shrink-0 flex flex-col border-b lg:border-b-0 lg:border lg:rounded-2xl border-border/40 p-3 lg:p-4 gap-3 lg:gap-4 tall:overflow-hidden"
		>
			<HomePrayerCard />
			<HomeSections />
			<HomeNews {news} />
		</div>

		<!-- Hidden on mobile. An explicit height (viewport minus header and padding) rather than flex-stretch:
		     on short viewports the row is content-sized, and without a definite height the inner infinite-scroll
		     pane would grow unbounded and keep fetching pages. -->
		<div class="hidden lg:flex flex-1 min-w-0 flex-col lg:h-[min(calc(100dvh-68px-2rem),73rem)] lg:overflow-hidden lg:border lg:border-border/40 lg:rounded-2xl">
			<HomeTabs {books} {bayans} {malfuzat} {articles} />
		</div>
	</div>
</div>
