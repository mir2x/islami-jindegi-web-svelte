<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { NamazTimeDetail } from '#lib/types.ts';

	let { hasSelection, loading, detail }: { hasSelection: boolean; loading: boolean; detail: NamazTimeDetail | null } = $props();
	const t = useT('NamazTimesPage');
	const tDetail = useT('NamazTimesDetail');
	const label = 'text-base font-bold uppercase tracking-wider text-primary mb-3';
</script>

<div class="flex flex-col w-full lg:min-h-0 rounded-2xl border border-border bg-card overflow-hidden">
	{#if !hasSelection}
		<div class="flex-1 flex flex-col items-center justify-center text-center p-8">
			<Clock class="w-14 h-14 text-muted-foreground/25 mb-4" />
			<p class="text-lg text-muted-foreground">{t('selectPrompt')}</p>
		</div>
	{:else if loading || !detail}
		<div class="p-6 sm:p-8 space-y-4 animate-pulse">
			<div class="h-6 bg-muted rounded w-1/3"></div>
			<div class="space-y-2 pt-4">
				<div class="h-3 bg-muted rounded w-full"></div>
				<div class="h-3 bg-muted rounded w-5/6"></div>
				<div class="h-3 bg-muted rounded w-4/5"></div>
			</div>
		</div>
	{:else}
		<div class="shrink-0 p-6 sm:p-8 pb-4 border-b border-border/60"><h2 class="text-3xl font-bold text-foreground">{detail.titleBn ?? detail.title}</h2></div>
		<div class="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8">
			<div class="mb-4">
				<p class={label}>{tDetail('masail')}</p>
				<div class="prose-content text-lg leading-relaxed text-foreground">{@html detail.masail}</div>
			</div>
			{#if detail.fazail}
				<div class="pt-4 border-t border-border/60">
					<p class={label}>{tDetail('fazail')}</p>
					<div class="prose-content text-lg leading-relaxed text-foreground">{@html detail.fazail}</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
