<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Crosshair from '@lucide/svelte/icons/crosshair';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { BD_DISTRICTS } from '#lib/bd-districts.ts';
	import { chooseDistrict, loc, placeName, startLocation, useMyPosition } from '#lib/location.svelte.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { onMount } from 'svelte';

	/** `class` styles the trigger, which sits on different backgrounds (the prayer header is green, other pages are plain). */
	let { class: cls = '' }: { class?: string } = $props();

	const t = useT('Location');
	const locale = $derived(currentLocale());
	let open = $state(false);
	let root: HTMLElement | undefined = $state();

	onMount(() => startLocation(locale));

	const label = $derived(placeName(loc.place, locale, t('defaultName'), t('yourPosition')));
	const select = $derived(loc.place.source === 'district' ? (loc.place.districtId ?? '') : '');
</script>

<svelte:window
	onclick={(e) => {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}}
	onkeydown={(e) => e.key === 'Escape' && (open = false)}
/>

<div bind:this={root} class="relative inline-block">
	<button type="button" class={cn('inline-flex items-center gap-1.5 text-left', cls)} aria-expanded={open} aria-haspopup="dialog" onclick={() => (open = !open)}>
		{#if loc.locating}<Loader2 class="w-3.5 h-3.5 animate-spin opacity-70 shrink-0" />{:else}<MapPin class="w-3.5 h-3.5 opacity-70 shrink-0" />{/if}
		<span>{label}</span>
		<ChevronDown class="w-3.5 h-3.5 opacity-70 shrink-0" />
	</button>

	{#if open}
		<div
			role="dialog"
			aria-label={t('title')}
			class="absolute right-0 top-full mt-2 z-40 w-72 max-w-[calc(100vw-2rem)] p-3 space-y-3 bg-card text-card-foreground border border-border rounded-2xl shadow-xl text-sm"
		>
			<button
				type="button"
				class="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
				onclick={() => useMyPosition(locale)}
			>
				{#if loc.locating}<Loader2 class="w-4 h-4 animate-spin" />{:else}<Crosshair class="w-4 h-4" />{/if}{t('useMyPosition')}
			</button>
			{#if loc.denied}<p class="text-destructive text-xs">{t('denied')}</p>{/if}

			<label class="block">
				<span class="block mb-1 text-xs text-muted-foreground">{t('chooseDistrict')}</span>
				<select
					class="w-full h-10 rounded-lg border border-border bg-background px-2 text-foreground"
					value={select}
					onchange={(e) => {
						chooseDistrict(e.currentTarget.value);
						open = false;
					}}
				>
					<option value="" disabled>{t('districtPlaceholder')}</option>
					{#each BD_DISTRICTS as d (d.en)}<option value={d.en}>{locale === 'bn' ? d.bn : d.en}</option>{/each}
				</select>
			</label>
			<p class="text-xs text-muted-foreground">{t('privacy')}</p>
		</div>
	{/if}
</div>
