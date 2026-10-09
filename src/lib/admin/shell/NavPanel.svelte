<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import LogOut from '@lucide/svelte/icons/log-out';
	import PanelLeftClose from '@lucide/svelte/icons/panel-left-close';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';
	import { page } from '$app/state';
	import LocaleSwitcher from '#lib/components/layout/LocaleSwitcher.svelte';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { auth } from '../auth.svelte.ts';
	import { NAV } from './nav.ts';

	interface Props {
		/** Icon-only rail (desktop, collapsed). */
		collapsed?: boolean;
		dark: boolean;
		ontheme: () => void;
		ontoggle?: () => void;
		onnavigate?: () => void;
	}
	let { collapsed = false, dark, ontheme, ontoggle, onnavigate }: Props = $props();

	const t = useT('AdminNav');
	const site = $derived(localePath('/'));
	const btn = 'p-1.5 rounded-lg text-sidebar-foreground/55 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors';
	const wide =
		'flex items-center gap-2 px-2 py-1.5 rounded-lg text-base font-medium text-sidebar-foreground/65 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors';
	const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring';
</script>

<div class={cn('flex items-center h-[74px] shrink-0 py-5', collapsed ? 'justify-center px-3' : 'gap-3 px-5')}>
	<a
		href={site}
		target="_blank"
		rel="noopener noreferrer"
		aria-label="Open Islami Jindegi website in a new tab"
		title="Open Islami Jindegi website"
		class={cn(
			'w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-black tracking-wider shrink-0 shadow-lg shadow-sidebar-primary/30 transition-transform hover:scale-105',
			ring
		)}>IJ</a
	>
	{#if !collapsed}
		<a
			href={site}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Open Islami Jindegi website in a new tab"
			class={cn('min-w-0 flex-1 rounded-md hover:text-sidebar-accent-foreground', ring)}
		>
			<p class="text-lg font-bold leading-tight text-sidebar-foreground truncate">{t('brand')}</p>
			<p class="text-sm font-semibold tracking-[0.16em] uppercase text-sidebar-foreground/45 mt-0.5">{t('brandSub')}</p>
		</a>
		{#if ontoggle}<button type="button" onclick={ontoggle} aria-label={t('collapseSidebar')} title={t('collapseSidebar')} class={cn('shrink-0 text-sidebar-foreground/50', btn)}
				><PanelLeftClose class="w-4 h-4" /></button
			>{/if}
	{/if}
</div>

{#if collapsed && ontoggle}
	<div class="flex justify-center pb-2">
		<button type="button" onclick={ontoggle} aria-label={t('expandSidebar')} title={t('expandSidebar')} class={btn}><PanelLeftOpen class="w-4 h-4" /></button>
	</div>
{/if}

<div class="mx-4 h-px bg-sidebar-border"></div>

<nav class={cn('flex-1 pt-4 pb-4 flex flex-col gap-0.5 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
	{#if !collapsed}<p class="px-2 pt-1 pb-2.5 text-sm font-bold uppercase tracking-[0.18em] text-sidebar-foreground/35">{t('navigation')}</p>{/if}
	{#each NAV as item (item.href)}
		{@const href = localePath(item.href)}
		{@const active = 'exact' in item ? page.url.pathname === href : page.url.pathname.startsWith(href)}
		{@const label = t(item.key)}
		<a
			{href}
			onclick={onnavigate}
			title={collapsed ? label : undefined}
			aria-current={active ? 'page' : undefined}
			class={cn(
				'flex items-center gap-2.5 rounded-lg text-base font-medium transition-all duration-150',
				collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
				active
					? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25 font-semibold'
					: 'text-sidebar-foreground/65 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
			)}
		>
			<item.icon class="w-4 h-4 shrink-0" />
			{#if !collapsed}<span>{label}</span>{/if}
		</a>
	{/each}
</nav>

<div class={cn('border-t border-sidebar-border shrink-0', collapsed ? 'py-3 flex flex-col items-center gap-2.5' : 'px-3 py-3 flex flex-col gap-2.5')}>
	{#if collapsed}
		<button type="button" onclick={ontheme} aria-label={dark ? t('switchToLight') : t('switchToDark')} title={dark ? t('lightMode') : t('darkMode')} class={btn}>
			{#if dark}<Sun class="w-4 h-4" />{:else}<Moon class="w-4 h-4" />{/if}
		</button>
		<button type="button" onclick={auth.clear} aria-label={t('signOut')} title={t('signOut')} class={btn}><LogOut class="w-4 h-4" /></button>
		<p class="text-sm font-medium text-sidebar-foreground/30">v1</p>
	{:else}
		<LocaleSwitcher class="self-start" />
		<div class="flex items-center justify-between">
			<button type="button" onclick={ontheme} class={wide}>
				{#if dark}<Sun class="w-4 h-4 shrink-0" />{:else}<Moon class="w-4 h-4 shrink-0" />{/if}
				<span>{dark ? t('lightMode') : t('darkMode')}</span>
			</button>
			<button type="button" onclick={auth.clear} title={t('signOut')} aria-label={t('signOut')} class={wide}><LogOut class="w-4 h-4 shrink-0" /></button>
		</div>
	{/if}
</div>
