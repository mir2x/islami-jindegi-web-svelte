<script lang="ts">
	import BrandIcon from '#lib/components/icons/BrandIcon.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';

	let { class: className = '', variant = 'compact' }: { class?: string; variant?: 'compact' | 'badge' | 'list' | 'tiles' } = $props();
	const t = useT('Nav');

	const STORES = [
		{
			key: 'googlePlay',
			href: 'https://play.google.com/store/apps/details?id=com.islami_jindegi',
			icon: 'googleplay',
			size: 'w-6 h-6',
			badgeSize: 'w-5 h-5',
			caption: 'GET IT ON',
			name: 'Google Play'
		},
		{
			key: 'appStore',
			href: 'https://apps.apple.com/us/app/islami-jindegi/id1271205014',
			icon: 'apple',
			size: 'w-7 h-7',
			badgeSize: 'w-6 h-6',
			caption: 'Download on the',
			name: 'App Store'
		},
		{
			key: 'microsoftStore',
			href: 'https://apps.microsoft.com/detail/9pfc3fbk5bn0?hl=en-US&gl=US',
			icon: 'windows',
			size: 'w-5 h-5',
			badgeSize: 'w-6 h-6',
			caption: 'Available on',
			name: 'Microsoft Store'
		}
	] as const;
</script>

{#if variant === 'list'}
	<div class={cn('flex flex-col', className)}>
		{#each STORES as s (s.key)}
			<a
				href={s.href}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-3 px-3 py-3 rounded-lg text-lg font-medium text-foreground hover:bg-muted transition-colors"
			>
				<BrandIcon name={s.icon} class={cn(s.badgeSize, 'shrink-0')} />
				{s.name}
			</a>
		{/each}
	</div>
{:else if variant === 'tiles'}
	<div class={cn('grid grid-cols-3 gap-2', className)}>
		{#each STORES as s (s.key)}
			<a
				href={s.href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={t(s.key)}
				class="flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-xl border border-border bg-muted/40 text-foreground hover:bg-muted transition-colors"
			>
				<BrandIcon name={s.icon} class={cn(s.badgeSize, 'shrink-0')} />
				<span class="text-[11px] font-medium leading-tight text-center">{s.name}</span>
			</a>
		{/each}
	</div>
{:else if variant === 'badge'}
	<div class={cn('flex flex-wrap items-center gap-2.5', className)}>
		{#each STORES as s (s.key)}
			<a
				href={s.href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={t(s.key)}
				class="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
			>
				<BrandIcon name={s.icon} class={cn(s.badgeSize, 'shrink-0 text-foreground')} />
				<span class="flex flex-col leading-tight">
					<span class="text-[10px] text-muted-foreground">{s.caption}</span>
					<span class="text-sm font-semibold text-foreground">{s.name}</span>
				</span>
			</a>
		{/each}
	</div>
{:else}
	<div class={cn('flex items-center gap-1', className)}>
		{#each STORES as s (s.key)}
			<a
				href={s.href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={t(s.key)}
				title={t(s.key)}
				class="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
			>
				<BrandIcon name={s.icon} class={s.size} />
			</a>
		{/each}
	</div>
{/if}
