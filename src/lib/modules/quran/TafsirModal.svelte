<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import X from '@lucide/svelte/icons/x';
	import { apiGet } from '#lib/client-api.ts';
	import Overlay from '#lib/components/ui/Overlay.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { QuranAyahDetail, QuranTafsir } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		surahNumber: number;
		surahName: string;
		ayahNumber: number;
		onclose: () => void;
	}
	let { surahNumber, surahName, ayahNumber, onclose }: Props = $props();

	const t = useT('TafsirModal');
	const n = useNum();
	let tafsirs = $state<QuranTafsir[] | null>(null);
	let error = $state(false);
	// Until the reader picks a panel, the first tafsir is open; `null` collapses all.
	let picked = $state<string | null | undefined>(undefined);
	const openId = $derived(picked === undefined ? (tafsirs?.[0]?.id ?? null) : picked);

	// Tafsirs are heavy, so they are fetched per ayah on demand rather than with the surah.
	$effect(() => {
		const ac = new AbortController();
		tafsirs = null;
		error = false;
		picked = undefined;
		apiGet<QuranAyahDetail>(`/api/quran/surahs/${surahNumber}/ayahs/${ayahNumber}?tafsirs=all&translations=none&words=false`, ac.signal).then((res) => {
			if (ac.signal.aborted) return;
			if (res) tafsirs = res.tafsirs;
			else error = true;
		});
		return () => ac.abort();
	});
</script>

<Overlay {onclose} label={t('title')} class="w-full sm:max-w-2xl sm:mx-4 max-h-[85vh] rounded-t-2xl sm:rounded-2xl">
	<div class="shrink-0 flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border">
		<div class="min-w-0">
			<p class="text-sm font-bold text-foreground">{t('title')}</p>
			<p class="text-xs text-muted-foreground truncate">{t('subtitle', { surahName, ayahNumber: n(ayahNumber) })}</p>
		</div>
		<button
			type="button"
			onclick={onclose}
			aria-label="Close"
			class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
			><X class="w-4 h-4" /></button
		>
	</div>
	<div class="flex-1 overflow-y-auto">
		{#if error}<p class="text-center text-sm text-destructive py-12">{t('loadError')}</p>
		{:else if tafsirs === null}<div class="flex items-center justify-center gap-2 py-16 text-muted-foreground">
				<Loader2 class="w-4 h-4 animate-spin" />
				<p class="text-sm">{t('loading')}</p>
			</div>
		{:else if tafsirs.length === 0}<p class="text-center text-sm text-muted-foreground py-12">{t('empty')}</p>
		{:else}
			{#each tafsirs as item (item.id)}
				{@const open = openId === item.id}
				<div class="border-b border-border/60 last:border-0">
					<button
						type="button"
						onclick={() => (picked = open ? null : item.id)}
						aria-expanded={open}
						class="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
					>
						<span class="text-sm font-semibold text-foreground">{item.name}</span>
						<ChevronDown class={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')} />
					</button>
					{#if open}<p class="px-4 pb-4 text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">{item.text}</p>{/if}
				</div>
			{/each}
		{/if}
	</div>
</Overlay>
