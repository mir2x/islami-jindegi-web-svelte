<script lang="ts">
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { NAV_LINKS } from './nav-links.ts';
	import StoreBadges from './StoreBadges.svelte';

	const t = useT('Nav');
	const tFooter = useT('Footer');
	const tMeta = useT('Metadata');
	const locale = $derived(currentLocale());

	// The CMS-managed static pages, minus 'bismillah-tafseer' which is reader content, not a site page.
	const SITE_PAGES = [
		{ key: 'about', href: '/about' },
		{ key: 'contact', href: '/contact' },
		{ key: 'donate', href: '/donate' },
		{ key: 'importantMatters', href: '/important-matters' },
		{ key: 'askMasail', href: '/ask-masail' },
		{ key: 'privacyPolicy', href: '/privacy-policy' }
	];
	// The footer lists every section except the three Quran/Hadith/Topics-first entries of the header.
	const SECTIONS = NAV_LINKS.filter((l) => l.href !== '/quran' && l.href !== '/hadith');
	const SOCIAL = [
		{ label: 'Twitter', href: 'https://x.com/IJindegi' },
		{ label: 'Facebook', href: 'https://www.facebook.com/islamijindegiii' },
		{ label: 'YouTube', href: 'https://www.youtube.com/@IslamiJindegi' }
	];
	const linkClass = 'text-sm text-muted-foreground hover:text-foreground transition-colors';
	const headingClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3';
</script>

{#snippet column(heading: string, links: { label: string; href: string }[])}
	<div>
		<p class={headingClass}>{heading}</p>
		<ul class="space-y-2">
			{#each links as link (link.href)}
				<li><a href={localePath(link.href, locale)} class={linkClass}>{link.label}</a></li>
			{/each}
		</ul>
	</div>
{/snippet}

<footer class="mt-20 border-t border-border/60 bg-muted/30 print:hidden">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-10">
			<div class="md:col-span-1">
				<div class="flex items-center gap-2.5 mb-3">
					<img src="/logo-72.webp" alt={tMeta('title')} width="28" height="28" class="rounded-lg" loading="lazy" />
					<span class="font-bold text-foreground">{tMeta('title')}</span>
				</div>
				<p class="text-sm text-muted-foreground leading-relaxed max-w-xs">{tFooter('tagline')}</p>
				<StoreBadges variant="badge" class="mt-4" />
			</div>

			<div class="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
				{@render column(
					tFooter('contentHeading'),
					SECTIONS.slice(0, 5).map((s) => ({ label: t(s.key), href: s.href }))
				)}
				{@render column(
					tFooter('moreHeading'),
					SECTIONS.slice(5).map((s) => ({ label: t(s.key), href: s.href }))
				)}
				{@render column(
					tFooter('siteHeading'),
					SITE_PAGES.map((p) => ({ label: tFooter(p.key), href: p.href }))
				)}
			</div>
		</div>

		<div class="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
			<p class="text-xs text-muted-foreground">{tFooter('copyright', { year: new Date().getFullYear(), brand: tMeta('title') })}</p>
			<div class="flex items-center gap-4">
				{#each SOCIAL as s (s.label)}<a href={s.href} class="text-xs text-muted-foreground hover:text-foreground transition-colors">{s.label}</a>{/each}
			</div>
		</div>
	</div>
</footer>
