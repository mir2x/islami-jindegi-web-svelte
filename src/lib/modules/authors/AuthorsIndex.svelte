<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { AUTHOR_BROWSE_MODULES, authorHref } from '#lib/authors.ts';
	import { bn } from '#lib/bengali-numerals.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { AuthorBrowseIndex, AuthorBrowseSummary } from '#lib/types.ts';

	/** Searchable grid of authors; groups become headed sections, ungrouped authors come last. */
	let { index }: { index: AuthorBrowseIndex } = $props();

	const t = useT('AuthorsPage');
	const tNav = useT('Nav');
	const locale = $derived(currentLocale());
	const num = (n: number) => (locale === 'bn' ? bn(n) : String(n));
	let query = $state('');

	const sections = $derived.by(() => {
		const q = query.trim();
		const filter = (authors: AuthorBrowseSummary[]) => (q ? authors.filter((x) => x.name.includes(q)) : authors);
		return [
			...index.groups.map((g) => ({ key: g.id, title: g.title as string | null, authors: filter(g.authors) })),
			// With groups, the rest sit under their own heading; without, it is one plain grid.
			{ key: 'ungrouped', title: index.groups.length > 0 ? t('otherAuthors') : null, authors: filter(index.ungrouped) }
		].filter((s) => s.authors.length > 0);
	});
	const summary = (author: AuthorBrowseSummary) =>
		AUTHOR_BROWSE_MODULES.filter((m) => (author.counts[m.key] ?? 0) > 0)
			.map((m) => `${num(author.counts[m.key]!)} ${tNav(m.navKey)}`)
			.join(' · ');
</script>

<div>
	<div class="relative max-w-md mb-8">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
		<input
			type="search"
			bind:value={query}
			placeholder={t('searchPlaceholder')}
			class="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-base outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
		/>
	</div>

	{#if sections.length === 0}<p class="py-16 text-center text-muted-foreground">{t('empty')}</p>{/if}

	{#each sections as s (s.key)}
		<section class="mb-10">
			{#if s.title}<h2 class="text-2xl font-bold text-foreground mb-4">{s.title}</h2>{/if}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
				{#each s.authors as author (author.id)}
					<a
						href={localePath(authorHref(author), locale)}
						class="group flex flex-col gap-2 p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-200"
					>
						<p class="font-bold text-[18px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">{author.name}</p>
						{#if author.description}<p class="text-[14px] text-muted-foreground leading-snug line-clamp-2">{author.description}</p>{/if}
						<p class="text-[13px] text-muted-foreground leading-snug line-clamp-2">{summary(author)}</p>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>
