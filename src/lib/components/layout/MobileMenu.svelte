<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import BookOpenText from '@lucide/svelte/icons/book-open-text';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Clock from '@lucide/svelte/icons/clock';
	import FileText from '@lucide/svelte/icons/file-text';
	import HandHeart from '@lucide/svelte/icons/hand-heart';
	import Heart from '@lucide/svelte/icons/heart';
	import Library from '@lucide/svelte/icons/library';
	import Mic from '@lucide/svelte/icons/mic';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Quote from '@lucide/svelte/icons/quote';
	import School from '@lucide/svelte/icons/school';
	import Tags from '@lucide/svelte/icons/tags';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { NAV_LINKS } from './nav-links.ts';
	import StoreBadges from './StoreBadges.svelte';

	let { open, isActive, onclose }: { open: boolean; isActive: (href: string) => boolean; onclose: () => void } = $props();

	const t = useT('Nav');
	const tMeta = useT('Metadata');
	const locale = $derived(currentLocale());

	const ICONS: Record<string, typeof BookOpen> = {
		'/quran': BookOpen,
		'/hadith': BookOpenText,
		'/topics': Tags,
		'/books': Library,
		'/bayan': Mic,
		'/malfuzat': Quote,
		'/masail': CircleHelp,
		'/dua': Heart,
		'/articles': FileText,
		'/news': Newspaper,
		'/madrasah': School,
		'/namaz-times': Clock
	};
	const LINKS = NAV_LINKS.filter((l) => l.href !== '/donate');

	// While the drawer is open the page behind it must not scroll.
	$effect(() => {
		if (!open) return;
		document.body.style.overflow = 'hidden';
		return () => (document.body.style.overflow = '');
	});
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && onclose()} />

<!-- Outside the header: its backdrop blur would otherwise trap this fixed element. -->
<div class={cn('lg:hidden fixed inset-0 z-[60] print:hidden', !open && 'pointer-events-none')} aria-hidden={!open}>
	<button type="button" tabindex="-1" aria-label={t('toggleMenu')} onclick={onclose} class={cn('absolute inset-0 bg-black/55 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')}></button>
	<aside class={cn('absolute left-0 top-0 h-full w-[82%] max-w-sm bg-background border-r border-border shadow-2xl flex flex-col transition-transform duration-200', open ? 'translate-x-0' : '-translate-x-full')}>
		<div class="flex items-center justify-between gap-3 px-5 h-[76px] shrink-0">
			<a href={localePath('/', locale)} class="flex items-center gap-3 min-w-0">
				<img src="/logo-104.webp" alt="" width="44" height="44" class="rounded-xl shadow-sm" />
				<span class="text-xl font-bold text-foreground truncate">{tMeta('title')}</span>
			</a>
		</div>

		<nav class="flex-1 overflow-y-auto px-3 py-2">
			{#each LINKS as link (link.href)}
				{@const Icon = ICONS[link.href] ?? BookOpen}
				<a
					href={localePath(link.href, locale)}
					class={cn('flex items-center gap-4 px-3 py-3 rounded-lg text-lg transition-colors', isActive(link.href) ? 'text-primary bg-primary/10 font-semibold' : 'text-foreground hover:bg-muted')}
				>
					<Icon class="w-5 h-5 shrink-0" />
					{t(link.key)}
				</a>
			{/each}
		</nav>

		<div class="shrink-0 border-t border-border/60 px-5 py-4 space-y-3">
			<a href={localePath('/donate', locale)} class="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-sm hover:opacity-90 transition-opacity">
				<HandHeart class="w-5 h-5" />
				{t('donate')}
			</a>
			<StoreBadges variant="tiles" />
		</div>
	</aside>
</div>
