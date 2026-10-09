<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Img from '#lib/components/ui/Img.svelte';
	import DetailFrame from '#lib/components/shared/DetailFrame.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const m = $derived(data.madrasah);
	const t = useT('MadrasahDetail');
	const locale = $derived(currentLocale());
	const row = 'flex items-center gap-3 px-5 py-3.5';
</script>

<DetailFrame path={`/madrasah/${m.id}`} title={m.title} shareHtml={m.introduction} backHref="/madrasah" backLabel={t('backToList')} class="max-w-3xl">
	<h1 class="text-2xl font-bold text-foreground leading-snug mb-6">{m.title}</h1>

	{#if m.introduction}
		<div class="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8 print:border-none print:p-0">
			<div class="prose-content text-base leading-relaxed text-foreground">{@html m.introduction}</div>
		</div>
	{/if}

	{#if data.photos.length > 0}
		<section class="mb-8" aria-label={t('photos')}>
			<div class={data.photos.length === 1 ? 'grid grid-cols-1' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
				{#each data.photos as photo, i (photo.id ?? i)}
					<a href={photo.imageUrl} target="_blank" rel="noopener noreferrer" class="group relative block aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
						<Img src={photo.imageUrl} alt={m.title} sizes="(max-width: 640px) 100vw, 384px" class="object-cover group-hover:scale-[1.02] transition-transform duration-300" />
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.infos.length > 0}
		<section aria-label={t('chapters')}>
			<h2 class="text-lg font-semibold text-foreground mb-3">{t('chapters')}</h2>
			<ul class="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden print:hidden">
				{#each data.infos as info, idx (info.id ?? idx)}
					<li>
						{#if info.id}
							<a href={localePath(`/madrasah/${m.id}/chapter/${info.id}`, locale)} class="group {row} hover:bg-primary/5 transition-colors">
								<BookOpen class="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
								<span class="flex-1 text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{info.label}</span>
								<ArrowRight class="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
							</a>
						{:else}
							<div class={row}><BookOpen class="w-4 h-4 text-muted-foreground shrink-0" /><span class="text-base font-medium text-foreground leading-snug">{info.label}</span></div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</DetailFrame>
