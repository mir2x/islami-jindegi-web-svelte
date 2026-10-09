<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const item = $derived(data.item);
	const t = useT('NamazTimesDetail');
	const card = 'bg-card border border-border rounded-2xl p-6 sm:p-8';
	const heading = 'text-sm font-bold uppercase tracking-wider text-primary mb-4';
</script>

<div class="max-w-3xl mx-auto px-4 py-8">
	<a href={localePath('/namaz-times', currentLocale())} class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
		<ChevronLeft class="w-4 h-4" />{t('backToList')}
	</a>
	<h1 class="text-2xl font-bold text-foreground mb-8">{item.titleBn ?? item.title}</h1>

	<div class="{card} mb-4">
		<h2 class={heading}>{t('masail')}</h2>
		<div class="prose-content text-[15px] leading-relaxed text-foreground">{@html item.masail}</div>
	</div>
	{#if item.fazail}
		<div class={card}>
			<h2 class={heading}>{t('fazail')}</h2>
			<div class="prose-content text-[15px] leading-relaxed text-foreground">{@html item.fazail}</div>
		</div>
	{/if}
</div>
