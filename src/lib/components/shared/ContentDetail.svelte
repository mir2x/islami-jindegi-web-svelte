<script lang="ts">
	import AdminEditButton from './AdminEditButton.svelte';
	import type { Snippet } from 'svelte';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Tag from '@lucide/svelte/icons/tag';
	import User from '@lucide/svelte/icons/user';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import DetailFrame from './DetailFrame.svelte';
	import TopicLinks from './TopicLinks.svelte';

	interface Props {
		/** Locale-less list path and `Nav` key in one, e.g. `masail`. */
		section: string;
		id: string;
		title: string;
		author?: string | null;
		/** ISO date shown in the meta row; omit to hide it. */
		date?: string | null;
		categories: { id: string; title: string }[];
		audioUrl?: string | null;
		/** Namespace holding `audioLabel`. */
		audioNs?: string;
		moreTitle: string;
		more: { id: string; title: string; author: string | null; date: string | null }[];
		/** Show each suggestion's (short) date instead of its author. */
		moreDates?: boolean;
		/** HTML or text the Copy button copies. */
		shareHtml: string;
		children: Snippet;
	}
	let { section, id, title, author, date, categories, audioUrl, audioNs = '', moreTitle, more, moreDates = false, shareHtml, children }: Props = $props();

	const tNav = useT('Nav');
	const locale = $derived(currentLocale());
	// svelte-ignore state_referenced_locally
	const tAudio = useT(audioNs);
</script>

{#snippet related()}
	<aside>
		<h2 class="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{moreTitle}</h2>
		<div class="space-y-0.5">
			{#each more as m (m.id)}
				<a href={localePath(`/${section}/${m.id}`, locale)} class="block px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors">
					<p class="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">{m.title}</p>
					{#if moreDates && m.date}<p class="text-xs text-muted-foreground mt-0.5">{formatDate(m.date, locale, { month: 'short', year: false })}</p>{:else if m.author}<p
							class="text-xs text-muted-foreground mt-0.5"
						>
							{m.author}
						</p>{/if}
				</a>
			{/each}
		</div>
	</aside>
{/snippet}

<AdminEditButton entity={section as 'articles'} {id} />
<DetailFrame path={`/${section}/${id}`} {title} {shareHtml} backHref={`/${section}`} backLabel={tNav(section)} sidebar={more.length > 0 ? related : undefined}>
	<h1 class="text-2xl font-bold text-foreground leading-snug mb-4">{title}</h1>

	{#if author || date || categories.length > 0}
		<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border/50">
			{#if author}<span class="flex items-center gap-1.5"><User class="w-3.5 h-3.5" />{author}</span>{/if}
			{#if date}<span class="flex items-center gap-1.5"><Calendar class="w-3.5 h-3.5" />{formatDate(date, locale)}</span>{/if}
			{#if categories.length > 0}<span class="flex items-center gap-1.5"><Tag class="w-3.5 h-3.5" /><TopicLinks {categories} /></span>{/if}
		</div>
	{/if}

	{#if audioUrl}
		<div class="mb-6 p-4 bg-muted/40 rounded-2xl">
			<p class="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">{tAudio('audioLabel')}</p>
			<audio controls preload="none" class="w-full" src={audioUrl}></audio>
		</div>
	{/if}

	{@render children()}
</DetailFrame>
