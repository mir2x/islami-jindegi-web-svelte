<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import School from '@lucide/svelte/icons/school';
	import { apiGet } from '#lib/client-api.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { MadrasahDetail, MadrasahListItem } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';

	let { item }: { item: MadrasahListItem } = $props();
	const t = useT('MadrasahPage');
	const locale = $derived(currentLocale());

	let expanded = $state(false);
	let detail = $state<MadrasahDetail | null>(null);
	let failed = $state(false);
	const loading = $derived(expanded && !detail && !failed);

	// Chapters load the first time the row opens; a failed load is retried the next time.
	$effect(() => {
		if (!expanded || detail) return;
		const ac = new AbortController();
		apiGet<MadrasahDetail>(`/api/madrasahs/${item.id}`, ac.signal).then((d) => {
			if (ac.signal.aborted) return;
			if (d) detail = d;
			else failed = true;
		});
		return () => ac.abort();
	});
	const toggle = () => {
		expanded = !expanded;
		failed = false;
	};
	const chapter = 'group flex items-center gap-3 px-5 py-3.5 hover:bg-primary/5 transition-colors';
</script>

<div class={cn('rounded-xl border bg-card overflow-hidden transition-colors', expanded ? 'border-primary/50' : 'border-border')}>
	<div class="flex items-center hover:bg-primary/5 transition-colors">
		<button type="button" onclick={toggle} aria-expanded={expanded} class="group flex-1 min-w-0 flex items-center gap-4 p-4 text-left">
			<div
				class={cn(
					'w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors',
					expanded ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
				)}
			>
				<School class="w-4.5 h-4.5" />
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-[17px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">{item.title}</p>
				{#if item.infoCount > 0}<p class="text-sm text-muted-foreground mt-0.5">{t('chapterCount', { count: item.infoCount })}</p>{/if}
			</div>
			<ChevronDown class={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', expanded ? 'rotate-180 text-primary' : 'group-hover:text-foreground')} />
		</button>
		<!-- Always-present link so the detail page is reachable without opening the row (and by crawlers). -->
		<a
			href={localePath(`/madrasah/${item.id}`, locale)}
			data-sveltekit-preload-data="off"
			aria-label={`${t('viewDetails')}: ${item.title}`}
			class="shrink-0 self-stretch flex items-center px-4 text-muted-foreground hover:text-primary transition-colors"
		>
			<ArrowRight class="w-4 h-4" />
		</a>
	</div>

	{#if expanded}
		<div class="border-t border-border/60 bg-muted/20">
			{#if loading}
				<div class="p-4 space-y-2 animate-pulse">
					{#each Array(3) as _, i (i)}<div class="h-12 bg-muted rounded-lg"></div>{/each}
				</div>
			{:else if detail && detail.infos.length > 0}
				<ul class="divide-y divide-border/40">
					{#each detail.infos as info, idx (info.id ?? idx)}
						<li>
							<a href={localePath(info.id ? `/madrasah/${item.id}/chapter/${info.id}` : `/madrasah/${item.id}`, locale)} class={chapter}>
								<BookOpen class="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
								<span class="flex-1 text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{info.label}</span>
								<ArrowRight class="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="p-4 text-base text-muted-foreground">{item.excerpt ?? t('noChaptersFound')}</p>
			{/if}
			{#if !loading}
				<div class="border-t border-border/60 px-5 py-3">
					<a href={localePath(`/madrasah/${item.id}`, locale)} class="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
						>{t('viewDetails')}<ArrowRight class="w-3.5 h-3.5" /></a
					>
				</div>
			{/if}
		</div>
	{/if}
</div>
