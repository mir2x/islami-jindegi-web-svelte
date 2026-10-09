<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import DetailFrame from '#lib/components/shared/DetailFrame.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';

	let { data } = $props();
	const t = useT('MadrasahChapter');
	const locale = $derived(currentLocale());
	const chapterHref = (id: string) => localePath(`/madrasah/${data.madrasahId}/chapter/${id}`, locale);
	const neighbour = 'group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors min-w-0';
</script>

<DetailFrame
	path={`/madrasah/${data.madrasahId}/chapter/${data.info.id}`}
	title={`${data.info.label} — ${data.madrasahTitle}`}
	shareHtml={data.info.info}
	backHref="/madrasah"
	backLabel={t('backToList')}
	class="max-w-3xl"
>
	{#snippet footer()}
		{#if data.prev || data.next}
			<div class="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
				{#if data.prev?.id}
					<a href={chapterHref(data.prev.id!)} class={neighbour}><ChevronLeft class="w-4 h-4 shrink-0 group-hover:text-primary" /><span class="truncate">{data.prev.label}</span></a
					>
				{:else}<span></span>{/if}
				{#if data.next?.id}
					<a href={chapterHref(data.next.id!)} class="{neighbour} text-right"
						><span class="truncate">{data.next.label}</span><ChevronLeft class="w-4 h-4 shrink-0 rotate-180 group-hover:text-primary" /></a
					>
				{:else}<span></span>{/if}
			</div>
		{/if}
		{#if data.chapters.length > 1}
			<div class="mt-8">
				<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('allChapters')}</p>
				<ul class="space-y-1">
					{#each data.chapters as ch, idx (ch.id ?? idx)}
						<li>
							<a
								href={ch.id ? chapterHref(ch.id) : '#'}
								class={cn(
									'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
									ch.id === data.info.id ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
								)}
							>
								<BookOpen class="w-3.5 h-3.5 shrink-0" />{ch.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/snippet}

	<p class="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{data.madrasahTitle}</p>
	<div class="flex items-start gap-3 mb-8">
		<div class="mt-0.5 w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center"><BookOpen class="w-4 h-4 text-primary" /></div>
		<h1 class="text-2xl font-bold text-foreground leading-snug">{data.info.label}</h1>
	</div>
	<div class="bg-card border border-border rounded-2xl p-6 sm:p-8 print:border-none print:p-0">
		<div class="prose-content text-base leading-relaxed text-foreground">{@html data.info.info}</div>
	</div>
</DetailFrame>
