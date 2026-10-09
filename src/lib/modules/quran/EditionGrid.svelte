<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Img from '#lib/components/ui/Img.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { MushafEdition } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';

	let { editions }: { editions: MushafEdition[] } = $props();
	const t = useT('QuranLanding');
	const n = useNum();
	const locale = $derived(currentLocale());
	const cover = (e: MushafEdition) => `${e.pagesBaseUrl}/${e.id === 'nurani' ? 'qm2' : 'qm1'}.${e.ext}`;
</script>

{#if editions.length === 0}
	<p class="text-center text-muted-foreground py-20">{t('mushafLoadError')}</p>
{:else}
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
		{#each editions as edition (edition.id)}
			<a
				href={localePath(`/quran/mushaf/${edition.id}`, locale)}
				data-sveltekit-preload-data="off"
				class="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200"
			>
				<div class="relative w-full bg-muted overflow-hidden" style="aspect-ratio: 1 / 1.5">
					<Img
						src={cover(edition)}
						alt={edition.title}
						sizes="(max-width: 640px) 50vw, 33vw"
						class="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
					/>
					<div class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-2 py-0.5 rounded-full">
						{t('pageCount', { count: n(edition.totalPages) })}
					</div>
				</div>
				<div class="p-3.5 flex items-start justify-between gap-2">
					<p class="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">{edition.title}</p>
					<ArrowRight class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
				</div>
			</a>
		{/each}
	</div>
{/if}
