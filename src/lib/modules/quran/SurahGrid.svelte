<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { DEFAULT_ARABIC_FONT } from '#lib/quran-fonts.ts';
	import type { QuranSurah } from '#lib/types.ts';
	import { useNum } from '#lib/use-num.svelte.ts';

	/** Searchable list of the 114 surahs; the same grid picks the surah for the text and the tilawat reader. */
	let { surahs, hrefPrefix }: { surahs: QuranSurah[]; hrefPrefix: string } = $props();
	const t = useT('QuranLanding');
	const n = useNum();
	const locale = $derived(currentLocale());
	let search = $state('');

	const revelation = (type: string) => (type === 'Meccan' ? t('meccan') : type === 'Medinan' ? t('medinan') : type);
	const filtered = $derived.by(() => {
		const q = search.trim();
		if (!q) return surahs;
		const lower = q.toLowerCase();
		return surahs.filter(
			(s) => s.nameBengali.includes(q) || s.nameEnglish.toLowerCase().includes(lower) || s.transliteration.toLowerCase().includes(lower) || String(s.number).includes(q)
		);
	});
</script>

<div>
	<div class="relative mb-6 max-w-sm">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
		<input
			type="text"
			bind:value={search}
			placeholder={t('searchSurah')}
			class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-ring"
		/>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
		{#each filtered as surah (surah.number)}
			<a
				href={localePath(`${hrefPrefix}/${surah.number}`, locale)}
				data-sveltekit-preload-data="off"
				class="group flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
			>
				<div
					class="w-9 h-9 shrink-0 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors tabular-nums"
				>
					{n(surah.number)}
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between gap-1">
						<p class="text-lg font-semibold text-foreground truncate">{surah.nameBengali}</p>
						<p class="text-xl text-muted-foreground shrink-0" style:font-family={DEFAULT_ARABIC_FONT} style:direction="rtl">{surah.nameArabic}</p>
					</div>
					<p class="text-base text-muted-foreground mt-0.5">
						{t('surahMeta', { ayahCount: n(surah.totalAyahs), revelation: revelation(surah.revelationType), para: n(surah.paraNumber) })}
					</p>
				</div>
			</a>
		{/each}
	</div>
	{#if filtered.length === 0}<p class="text-center text-muted-foreground py-16">{t('noSurahFound')}</p>{/if}
</div>
