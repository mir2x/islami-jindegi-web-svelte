<script lang="ts">
	import AdminEditButton from '#lib/components/shared/AdminEditButton.svelte';
	import Mic from '@lucide/svelte/icons/mic';
	import DetailFrame from '#lib/components/shared/DetailFrame.svelte';
	import BayanPlayerCard from '#lib/modules/bayan/BayanPlayerCard.svelte';
	import { formatDate } from '#lib/format-date.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';

	let { data } = $props();
	const bayan = $derived(data.item);
	const t = useT('BayanDetail');
	const locale = $derived(currentLocale());
</script>

{#snippet related()}
	<aside>
		<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('moreFrom', { name: bayan.author.name })}</p>
		<div class="space-y-2">
			{#each data.more as b (b.id)}
				<a
					href={localePath(`/bayan/${b.id}`, locale)}
					class="group flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
				>
					<div
						class="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
					>
						<Mic class="w-3.5 h-3.5" />
					</div>
					<div class="min-w-0">
						<p class="text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">{b.title}</p>
						{#if b.date}<p class="text-xs text-muted-foreground mt-1">{formatDate(b.date, locale)}</p>{/if}
					</div>
				</a>
			{/each}
		</div>
	</aside>
{/snippet}

<AdminEditButton entity="bayan" id={bayan.id} />
<DetailFrame
	path={`/bayan/${bayan.id}`}
	title={bayan.title}
	shareHtml={[bayan.author.name, bayan.excerpt].filter(Boolean).join('\n\n')}
	backHref="/bayan"
	backLabel={t('bayanList')}
	class="max-w-5xl sm:px-6"
	sidebar={data.more.length > 0 ? related : undefined}
>
	<BayanPlayerCard {bayan} class="rounded-2xl border border-border bg-card p-6 sm:p-8 print:border-none print:p-0" />
</DetailFrame>
