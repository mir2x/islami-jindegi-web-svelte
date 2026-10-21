<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import PageLinks from '#lib/components/shared/PageLinks.svelte';
	import { authorHref } from '#lib/authors.ts';
	import { bn } from '#lib/bengali-numerals.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import TopicEntries from '#lib/modules/topics/TopicEntries.svelte';
	import { TOPIC_PAGE_SIZE } from '#lib/topics.ts';
	import { cn } from '#lib/utils.ts';

	let { data } = $props();
	const author = $derived(data.author);
	const t = useT('AuthorsPage');
	const tNav = useT('Nav');
	const tCommon = useT('Common');
	const locale = $derived(currentLocale());
	const num = (n: number) => (locale === 'bn' ? bn(n) : String(n));
	const base = $derived(localePath(authorHref(author), locale));
	const active = $derived(data.modules.find((m) => m.key === data.activeKey) ?? null);
	const tab = (on: boolean) =>
		cn(
			'px-4 py-2 rounded-full text-[15px] font-medium whitespace-nowrap transition-colors',
			on ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-foreground hover:bg-muted'
		);
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
	<a href={localePath('/authors', locale)} class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
		<ChevronLeft class="w-4 h-4" />{t('backToAuthors')}
	</a>

	<h1 class="text-3xl sm:text-4xl font-bold text-foreground">{author.name}</h1>
	<p class="text-muted-foreground mt-2">{t('itemsCount', { count: num(author.total) })}</p>
	{#if author.description}<p class="text-lg text-muted-foreground mt-3 max-w-3xl">{author.description}</p>{/if}
	{#if author.info}<p class="text-base text-muted-foreground mt-3 max-w-3xl whitespace-pre-line">{author.info}</p>{/if}

	{#if data.modules.length > 1}
		<nav class="flex gap-2 overflow-x-auto mt-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
			<a href={base} class={tab(active === null)}>{tCommon('all')} ({num(author.total)})</a>
			{#each data.modules as m (m.key)}
				<a href="{base}?type={m.key}" class={tab(active?.key === m.key)}>{tNav(m.navKey)} ({num(author.counts[m.key] ?? 0)})</a>
			{/each}
		</nav>
	{/if}

	{#if active === null}
		<div class="mt-4">
			{#each data.modules as m (m.key)}
				<section class="py-6 border-t border-border/40 first:border-t-0">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-2xl font-bold text-foreground">{tNav(m.navKey)} <span class="text-muted-foreground font-medium">· {num(author.counts[m.key] ?? 0)}</span></h2>
						<a href="{base}?type={m.key}" class="flex items-center gap-1.5 text-base font-medium text-primary hover:gap-2 transition-all"
							>{tCommon('viewAll')} <ArrowRight class="w-4 h-4" /></a
						>
					</div>
					<div class="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
						{#each data.previews[m.key] ?? [] as entry (entry.id)}<TopicEntries {entry} variant="card" />{/each}
					</div>
				</section>
			{/each}
		</div>
	{:else}
		<section class="mt-4">
			<div class="max-w-3xl">
				{#each data.list?.entries ?? [] as entry (entry.id)}<TopicEntries {entry} variant="row" />{/each}
			</div>
			{#if data.list}<PageLinks
					basePath={`/authors/${author.slug ?? author.id}`}
					page={data.page}
					totalPages={Math.ceil(data.list.total / TOPIC_PAGE_SIZE)}
					query={`type=${active.key}`}
				/>{/if}
			<a href={localePath(`${active.path}?author=${author.id}`, locale)} class="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-primary hover:gap-2 transition-all">
				{t('openInSection', { section: tNav(active.navKey) })}
				<ArrowRight class="w-4 h-4" />
			</a>
		</section>
	{/if}
</div>
