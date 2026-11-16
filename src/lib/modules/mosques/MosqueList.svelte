<script lang="ts">
	import Footprints from '@lucide/svelte/icons/footprints';
	import Star from '@lucide/svelte/icons/star';
	import { formatNum } from '#lib/calendar.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { Mosque } from '#lib/types/mosques.ts';
	import { cn } from '#lib/utils.ts';
	import { displayName, walkMinutes } from './geo.ts';

	interface Row {
		mosque: Mosque;
		meters: number;
	}
	interface Props {
		rows: Row[];
		selectedId: string | null;
		mineId: string | null;
		onselect: (id: string) => void;
	}
	let { rows, selectedId, mineId, onselect }: Props = $props();

	const t = useT('MosquesPage');
	const locale = $derived(currentLocale());

	const distance = (m: number) =>
		m < 1000 ? t('meters', { m: formatNum(Math.round(m / 10) * 10, locale) }) : t('kilometers', { km: formatNum(Math.round(m / 100) / 10, locale) });
</script>

<ul class="divide-y divide-border/60">
	{#each rows as { mosque, meters } (mosque.id)}
		<li>
			<button
				type="button"
				onclick={() => onselect(mosque.id)}
				class={cn('w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-primary/5', selectedId === mosque.id && 'bg-primary/10')}
			>
				<span class="flex-1 min-w-0">
					<span class="flex items-center gap-1.5 text-base font-semibold text-foreground leading-snug">
						{displayName(mosque, locale) || t('unnamed')}
						{#if mosque.id === mineId}<Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" aria-label={t('mine')} />{/if}
					</span>
					{#if mosque.address}<span class="block text-sm text-muted-foreground truncate">{mosque.address}</span>{/if}
				</span>
				<span class="shrink-0 text-right text-sm tabular-nums">
					<span class="block font-semibold text-foreground">{distance(meters)}</span>
					<span class="inline-flex items-center gap-1 text-muted-foreground"><Footprints class="w-3.5 h-3.5" />{t('walk', { min: formatNum(walkMinutes(meters), locale) })}</span>
				</span>
			</button>
		</li>
	{/each}
</ul>
