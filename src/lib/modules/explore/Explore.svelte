<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Clock from '@lucide/svelte/icons/clock';
	import LibraryBig from '@lucide/svelte/icons/library-big';
	import Mic from '@lucide/svelte/icons/mic';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Rss from '@lucide/svelte/icons/rss';
	import School from '@lucide/svelte/icons/school';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Tags from '@lucide/svelte/icons/tags';
	import type { Component } from 'svelte';
	import Img from '#lib/components/ui/Img.svelte';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ArticleListItem, BayanListItem, Book, MalfuzatListItem, NewsListItem } from '#lib/types.ts';

	interface Props {
		books: Book[];
		bayans: BayanListItem[];
		malfuzat: MalfuzatListItem[];
		articles: ArticleListItem[];
		news: NewsListItem[];
	}
	let { books, bayans, malfuzat, articles, news }: Props = $props();

	const t = useT('ExplorePage');
	const tNav = useT('Nav');
	const tCommon = useT('Common');
	const tMeta = useT('Metadata');
	const locale = $derived(currentLocale());
	const href = (path: string) => localePath(path, locale);
	const shortDate = (iso: string) => formatDate(iso, locale, { month: 'short', year: false });

	type Icon = Component<{ class?: string }>;
	const SECTIONS: { key: string; sub: string; path: string; icon?: Icon }[] = $derived([
		{ key: 'quran', sub: t('subQuran'), path: '/quran', icon: BookMarked },
		{ key: 'hadith', sub: t('subHadith'), path: '/hadith', icon: LibraryBig },
		{ key: 'topics', sub: t('subTopics'), path: '/topics', icon: Tags },
		{ key: 'authors', sub: t('subAuthors'), path: '/authors' },
		{ key: 'books', sub: t('subBooks'), path: '/books', icon: BookOpen },
		{ key: 'bayan', sub: t('subBayan'), path: '/bayan', icon: Mic },
		{ key: 'malfuzat', sub: t('subMalfuzat'), path: '/malfuzat', icon: ScrollText },
		{ key: 'masail', sub: t('subMasail'), path: '/masail', icon: CircleHelp },
		{ key: 'dua', sub: t('subDua'), path: '/dua', icon: Sparkles },
		{ key: 'articles', sub: t('subArticles'), path: '/articles', icon: Newspaper },
		{ key: 'news', sub: t('subNews'), path: '/news', icon: Rss },
		{ key: 'madrasah', sub: t('subMadrasah'), path: '/madrasah', icon: School },
		{ key: 'namazTimes', sub: t('subNamazTimes'), path: '/namaz-times', icon: Clock }
	]);
	const scroller = 'flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory';
	const card = 'h-full bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all duration-200';
	const rowLink = 'group flex gap-4 py-4 border-b border-border/50 last:border-0';
</script>

{#snippet heading(title: string, path: string)}
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-foreground">{title}</h2>
		<a href={href(path)} class="flex items-center gap-1.5 text-base font-medium text-primary hover:gap-2 transition-all">{tCommon('viewAll')} <ArrowRight class="w-4 h-4" /></a>
	</div>
{/snippet}

<div class="pb-8">
	<section class="bg-gradient-to-b from-primary/5 to-transparent border-b border-border/40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
			<div class="flex justify-start mb-6">
				<a href={href('/')} class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
					><ChevronLeft class="w-4 h-4" />{t('backToClassic')}</a
				>
			</div>
			<p class="text-center text-2xl text-muted-foreground mb-3" style="font-family: serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
			<h1 class="text-center text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mt-4">{tMeta('title')}</h1>
			<p class="text-center text-xl text-muted-foreground mt-3">{tMeta('description')}</p>
		</div>
	</section>

	<div class="max-w-7xl mx-auto px-4 sm:px-6">
		<section class="py-10">
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
				{#each SECTIONS as { key, sub, path, icon: SectionIcon } (path)}
					<a href={href(path)} class="group flex flex-col gap-3 p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-200">
						{#if SectionIcon}
							<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
								<SectionIcon class="w-5 h-5" />
							</div>
						{/if}
						<div>
							<p class="font-bold text-[18px] text-foreground leading-tight">{tNav(key)}</p>
							<p class="text-[13px] text-muted-foreground mt-1 leading-tight">{sub}</p>
						</div>
						<div class="mt-auto flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
							{t('viewLabel')}
							<ArrowRight class="w-3.5 h-3.5" />
						</div>
					</a>
				{/each}
			</div>
		</section>

		{#if books.length > 0}
			<section class="py-8 border-t border-border/40">
				{@render heading(t('recentBooksHeading'), '/books')}
				<div class="{scroller} gap-5">
					{#each books as b (b.id)}
						<a href={href(`/books/${b.id}`)} data-sveltekit-preload-data="off" class="group shrink-0 w-40 snap-start">
							<div class="aspect-[3/4] relative rounded-xl overflow-hidden bg-muted mb-3 shadow-sm group-hover:shadow-md transition-all duration-200">
								<Img src={b.coverUrl || '/images/default-book.png'} alt={b.title} sizes="160px" class="object-cover group-hover:scale-[1.02] transition-transform duration-300" />
							</div>
							<p class="text-[15px] font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">{b.title}</p>
							{#if b.authors[0]}<p class="text-sm text-muted-foreground mt-1 truncate">{b.authors[0].name}</p>{/if}
						</a>
					{/each}
					<a
						href={href('/books')}
						class="shrink-0 w-40 snap-start flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors aspect-[3/4]"
						><ArrowRight class="w-6 h-6" /><span class="text-sm font-medium">{tCommon('viewAll')}</span></a
					>
				</div>
			</section>
		{/if}

		{#if bayans.length > 0}
			<section class="py-8 border-t border-border/40">
				{@render heading(t('recentBayansHeading'), '/bayan')}
				<div class={scroller}>
					{#each bayans as bayan (bayan.id)}
						<a href={href(`/bayan/${bayan.id}`)} data-sveltekit-preload-data="off" class="group shrink-0 w-72 snap-start">
							<div class={card}>
								<div class="flex items-center gap-3 mb-3">
									<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Mic class="w-5 h-5" /></div>
									<p class="text-sm text-muted-foreground truncate">{bayan.author?.name}</p>
								</div>
								<p class="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{bayan.title}</p>
								{#if bayan.location}<p class="text-sm text-muted-foreground mt-2 truncate">{bayan.location}</p>{/if}
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if malfuzat.length > 0}
			<section class="py-8 border-t border-border/40">
				{@render heading(t('recentMalfuzatHeading'), '/malfuzat')}
				<div class={scroller}>
					{#each malfuzat as item (item.id)}
						<a href={href(`/malfuzat/${item.id}`)} data-sveltekit-preload-data="off" class="group shrink-0 w-80 snap-start">
							<div class={card}>
								<div class="flex items-center gap-2 mb-3">
									<div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><ScrollText class="w-4 h-4" /></div>
									<p class="text-sm text-muted-foreground truncate">{item.author?.name}</p>
								</div>
								<p class="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.title}</p>
								{#if item.excerpt}<p class="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{item.excerpt}</p>{/if}
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if articles.length > 0 || news.length > 0}
			<section class="py-8 border-t border-border/40">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
					{#if articles.length > 0}
						<div>
							{@render heading(t('recentArticlesHeading'), '/articles')}
							{#each articles as item (item.id)}
								<a href={href(`/articles/${item.id}`)} class={rowLink}>
									<span class="text-xs text-muted-foreground tabular-nums shrink-0 mt-1 w-14">{shortDate(item.publishedAt ?? item.createdAt)}</span>
									<div class="flex-1 min-w-0">
										<p class="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.title}</p>
										{#if item.author}<p class="text-sm text-muted-foreground mt-1">{item.author.name}</p>{/if}
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if news.length > 0}
						<div>
							{@render heading(t('recentNewsHeading'), '/news')}
							{#each news as item (item.id)}
								<a href={href(`/news/${item.id}`)} class={rowLink}>
									<span class="text-xs text-muted-foreground tabular-nums shrink-0 mt-1 w-14">{shortDate(item.publishedAt ?? item.createdAt)}</span>
									<p class="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1 min-w-0">{item.title}</p>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</section>
		{/if}
	</div>
</div>
