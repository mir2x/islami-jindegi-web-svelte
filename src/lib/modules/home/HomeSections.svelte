<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';

	const t = useT('Home');
	const tNav = useT('Nav');
	const locale = $derived(currentLocale());

	const SECTIONS = $derived([
		{ label: tNav('quran'), href: '/quran', icon: 'quran' },
		{ label: tNav('books'), href: '/books', icon: 'book' },
		{ label: tNav('hadith'), href: '/hadith', icon: 'hadith' },
		{ label: tNav('bayan'), href: '/bayan', icon: 'bayan' },
		{ label: tNav('malfuzat'), href: '/malfuzat', icon: 'malfuzat' },
		{ label: tNav('masail'), href: '/masail', icon: 'masail' },
		{ label: tNav('dua'), href: '/dua', icon: 'dua' },
		{ label: tNav('articles'), href: '/articles', icon: 'article' },
		{ label: tNav('news'), href: '/news', icon: 'news' },
		{ label: tNav('madrasah'), href: '/madrasah', icon: 'madrasah' },
		{ label: tNav('namazTimes'), href: '/namaz-times', icon: 'namaz-time' },
		{ label: t('navSettings'), href: '/settings', icon: 'settings' }
	]);
</script>

<!-- A 3×4 tile grid on a rounded sheet, label inside each tile. On tall viewports the grid absorbs all
     leftover height (tiles stretch, icons capped high, floored low) so the column fits without scrolling;
     on short viewports icons take a fixed height and the page scrolls. -->
<div class="tall:flex-1 tall:min-h-0 flex flex-col rounded-3xl border border-border/40 p-2.5 lg:p-3">
	<nav class="tall:flex-1 tall:min-h-0 grid grid-cols-3 grid-rows-4 lg:grid-cols-4 lg:grid-rows-3 gap-2.5 lg:gap-3">
		{#each SECTIONS as { label, href, icon } (href)}
			<a
				href={localePath(href, locale)}
				class="group relative flex flex-col min-h-0 gap-1.5 sm:gap-2 rounded-2xl bg-card border border-border/40 shadow-sm dark:shadow-none p-2.5 sm:p-3 hover:border-primary/50 hover:shadow-md dark:hover:shadow-none transition-all"
			>
				<span
					class="absolute right-2 top-[62%] -translate-y-1/2 w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-primary/15 hidden sm:flex items-center justify-center group-hover:bg-primary transition-colors"
					><ChevronRight class="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary group-hover:text-primary-foreground transition-colors" /></span
				>
				<span class="flex-1 min-h-0 flex items-center justify-center"
					><img
						src="/icons/{icon}.svg"
						alt=""
						width="80"
						height="80"
						loading="lazy"
						decoding="async"
						class="h-12 sm:h-14 lg:h-20 sm:short:h-12 lg:short:h-12 max-h-full w-auto object-contain"
					/></span
				>
				<span class="shrink-0 text-center text-sm sm:text-base lg:text-lg font-semibold text-foreground leading-tight">{label}</span>
			</a>
		{/each}
	</nav>
</div>
