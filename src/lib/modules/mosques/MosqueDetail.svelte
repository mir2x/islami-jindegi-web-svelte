<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Globe from '@lucide/svelte/icons/globe';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Navigation from '@lucide/svelte/icons/navigation';
	import Phone from '@lucide/svelte/icons/phone';
	import Star from '@lucide/svelte/icons/star';
	import X from '@lucide/svelte/icons/x';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { Mosque } from '#lib/types/mosques.ts';
	import { directionsUrl, displayName, osmUrl, safeUrl } from './geo.ts';

	interface Props {
		mosque: Mosque;
		isMine: boolean;
		onclose: () => void;
		ontoggleMine: () => void;
	}
	let { mosque, isMine, onclose, ontoggleMine }: Props = $props();

	const t = useT('MosquesPage');
	const locale = $derived(currentLocale());
	const site = $derived(mosque.website ? safeUrl(mosque.website) : null);
	const line = 'flex items-start gap-2.5 text-sm text-foreground';
	const icon = 'w-4 h-4 mt-0.5 text-muted-foreground shrink-0';
</script>

<div class="p-4 space-y-3">
	<div class="flex items-start gap-2">
		<h2 class="flex-1 text-lg font-bold text-foreground leading-snug">{displayName(mosque, locale) || t('unnamed')}</h2>
		<button
			type="button"
			onclick={ontoggleMine}
			aria-pressed={isMine}
			aria-label={isMine ? t('removeMine') : t('setMine')}
			title={isMine ? t('removeMine') : t('setMine')}
			class="p-1.5 rounded-lg hover:bg-muted"
		>
			<Star class={isMine ? 'w-5 h-5 fill-amber-500 text-amber-500' : 'w-5 h-5 text-muted-foreground'} />
		</button>
		<button type="button" onclick={onclose} aria-label={t('close')} class="p-1.5 rounded-lg hover:bg-muted"><X class="w-5 h-5 text-muted-foreground" /></button>
	</div>

	{#if mosque.address}<p class={line}><MapPin class={icon} />{mosque.address}</p>{/if}
	{#if mosque.hours}<p class={line}><Clock class={icon} />{mosque.hours}</p>{/if}
	{#if mosque.phone}<p class={line}><Phone class={icon} /><a class="text-primary hover:underline" href="tel:{mosque.phone.replace(/[^+\d]/g, '')}">{mosque.phone}</a></p>{/if}
	{#if site}<p class={line}>
			<Globe class={icon} /><a class="text-primary hover:underline break-all" href={site} target="_blank" rel="noopener noreferrer nofollow">{mosque.website}</a>
		</p>{/if}
	{#if mosque.women}<p class="text-sm text-muted-foreground">{t('womenArea')}</p>{/if}

	<div class="flex flex-wrap gap-2 pt-1">
		<a
			href={directionsUrl(mosque)}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
		>
			<Navigation class="w-4 h-4" />{t('directions')}
		</a>
		<a
			href={osmUrl(mosque)}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"
		>
			<ExternalLink class="w-4 h-4" />{t('viewOnOsm')}
		</a>
	</div>
	<p class="text-xs text-muted-foreground">{t('fixData')}</p>
</div>
