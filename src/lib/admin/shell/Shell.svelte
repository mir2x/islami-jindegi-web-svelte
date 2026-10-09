<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { StoredValue } from '#lib/storage/stored.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { auth } from '../auth.svelte.ts';
	import { trackNavigation } from '../navigate.ts';
	import Toaster from '../ui/Toaster.svelte';
	import NavPanel from './NavPanel.svelte';
	import SignIn from './SignIn.svelte';

	let { children }: { children: Snippet } = $props();

	trackNavigation();

	const t = useT('AdminNav');
	// Own light/dark preference, independent of the public site's `ij-theme`; defaults to dark.
	const themePref = new StoredValue('ij-admin-theme', 'dark', { bare: true });
	const sidebarPref = new StoredValue('ij-admin-sidebar', 'expanded', { bare: true });

	const dark = $derived(themePref.current !== 'light');
	const collapsed = $derived(sidebarPref.current === 'collapsed');
	let mobileOpen = $state(false);

	const toggleTheme = () => themePref.set(dark ? 'light' : 'dark');
	const toggleCollapsed = () => sidebarPref.set(collapsed ? 'expanded' : 'collapsed');

	// `admin` scopes the dashboard-only tokens; the public theme is restored when leaving.
	onMount(() => {
		document.documentElement.classList.add('admin');
		return () => {
			document.documentElement.classList.remove('admin', 'dark');
			try {
				if (localStorage.getItem('ij-theme') === 'dark') document.documentElement.classList.add('dark');
			} catch {
				/* ignore */
			}
		};
	});
	$effect(() => {
		document.documentElement.classList.toggle('dark', dark);
	});
	// Close the drawer when the route changes.
	$effect(() => {
		void page.url.pathname;
		mobileOpen = false;
	});

	const site = $derived(localePath('/'));
</script>

<!-- Real enforcement lives in the API's [Authorize] attributes: this only decides whether to show the dashboard chrome. -->
{#if !auth.token}
	<SignIn />
{:else}
	<div class="flex h-screen bg-background">
		<aside class={cn('hidden md:flex flex-col shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-200', collapsed ? 'w-[68px]' : 'w-[220px]')}>
			<NavPanel {collapsed} {dark} ontheme={toggleTheme} ontoggle={toggleCollapsed} />
		</aside>

		{#if mobileOpen}
			<div class="fixed inset-0 z-50 md:hidden">
				<button type="button" tabindex="-1" aria-label="Close menu" class="absolute inset-0 bg-black/40" onclick={() => (mobileOpen = false)}></button>
				<aside class="absolute inset-y-0 left-0 flex w-[240px] flex-col bg-sidebar border-r border-sidebar-border shadow-lg animate-in slide-in-from-left duration-200">
					<NavPanel {dark} ontheme={toggleTheme} onnavigate={() => (mobileOpen = false)} />
				</aside>
			</div>
		{/if}

		<div class="flex flex-1 flex-col min-w-0 min-h-0">
			<div class="md:hidden flex items-center gap-3 h-14 px-4 border-b border-sidebar-border bg-sidebar shrink-0">
				<button
					type="button"
					onclick={() => (mobileOpen = true)}
					aria-label={t('openMenu')}
					class="p-1.5 -ml-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"><Menu class="w-5 h-5" /></button
				>
				<a
					href={site}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Open Islami Jindegi website in a new tab"
					class="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-black shrink-0">IJ</a
				>
				<a href={site} target="_blank" rel="noopener noreferrer" class="min-w-0 text-lg font-bold text-sidebar-foreground truncate rounded-md">{t('brand')} {t('brandSub')}</a>
				<button
					type="button"
					onclick={toggleTheme}
					aria-label={dark ? t('switchToLight') : t('switchToDark')}
					class="ml-auto p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
				>
					{#if dark}<Sun class="w-5 h-5" />{:else}<Moon class="w-5 h-5" />{/if}
				</button>
			</div>
			<!-- scrollbar-gutter keeps a short loading state from shifting the page sideways when rows land. -->
			<main class="flex-1 overflow-auto [scrollbar-gutter:stable]">{@render children()}</main>
		</div>
	</div>
{/if}
<Toaster />
