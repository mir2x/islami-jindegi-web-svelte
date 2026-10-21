<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Menu from '@lucide/svelte/icons/menu';
	import Settings from '@lucide/svelte/icons/settings';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import LocaleSwitcher from './LocaleSwitcher.svelte';
	import { NAV_LINKS } from './nav-links.ts';
	import MobileMenu from './MobileMenu.svelte';
	import StoreBadges from './StoreBadges.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const t = useT('Nav');
	const tMeta = useT('Metadata');

	let scrolled = $state(false);
	let menuOpen = $state(false);
	afterNavigate(() => (menuOpen = false));

	const locale = $derived(currentLocale());
	const isActive = (href: string) => {
		const path = page.url.pathname;
		const full = localePath(href, locale);
		return path === full || path.startsWith(`${full}/`);
	};
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 8)} />

<header class={cn('sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md transition-shadow duration-200 print:hidden', scrolled && 'shadow-sm border-b border-border/60')}>
	<div class="max-w-7xl mx-auto px-4 sm:px-6">
		<div class="flex items-center h-[68px] gap-6">
			<a href={localePath('/', locale)} class="flex items-center gap-3 shrink-0 group">
				<img src="/logo-104.webp" alt={tMeta('title')} width="52" height="52" class="rounded-xl shadow-sm" fetchpriority="high" />
				<span class="text-[21px] font-bold text-foreground leading-tight hidden sm:block">{tMeta('title')}</span>
			</a>

			<nav class="hidden lg:flex items-center gap-0.5 flex-1">
				{#each NAV_LINKS as link (link.href)}
					<a
						href={localePath(link.href, locale)}
						class={cn(
							'px-3 py-2 rounded-md text-[17px] font-medium transition-colors whitespace-nowrap',
							isActive(link.href) ? 'text-primary bg-primary/8 font-semibold' : 'text-foreground hover:text-foreground hover:bg-muted'
						)}
					>
						{t(link.key)}
					</a>
				{/each}
			</nav>

			<div class="ml-auto flex items-center gap-1">
				<StoreBadges class="hidden lg:flex" />
				<div class="hidden lg:block w-px h-5 bg-border mx-1"></div>
				<LocaleSwitcher class="mr-1" />
				<ThemeToggle />
				<a
					href={localePath('/settings', locale)}
					class="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
					aria-label={t('settings')}
				>
					<Settings class="w-5 h-5" />
				</a>
				<button
					type="button"
					class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
					onclick={() => (menuOpen = !menuOpen)}
					aria-label={t('toggleMenu')}
					aria-expanded={menuOpen}
				>
					<Menu class="w-5 h-5" />
				</button>
			</div>
		</div>
	</div>
</header>

<MobileMenu open={menuOpen} {isActive} onclose={() => (menuOpen = false)} />
