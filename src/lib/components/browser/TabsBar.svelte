<script lang="ts">
	import type { Component } from 'svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import type { ListState } from './list-state.svelte.ts';
	import type { BrowserConfig, Tab } from './types.ts';

	interface Props {
		cfg: BrowserConfig;
		list: ListState<{ id: string }>;
		textIcon: Component<{ class?: string }>;
		audioIcon: Component<{ class?: string }>;
	}
	let { cfg, list, textIcon, audioIcon }: Props = $props();

	// svelte-ignore state_referenced_locally
	const t = useT(cfg.ns);
	const tCommon = useT('Common');
	const tabs = $derived<{ key: Tab; label: string; icon?: Component<{ class?: string }> }[]>([
		{ key: 'all', label: cfg.commonAllTab ? tCommon('all') : t('tabAll') },
		{ key: 'text', label: t('tabText'), icon: textIcon },
		{ key: 'audio', label: t('tabAudio'), icon: audioIcon }
	]);
</script>

<div class="inline-flex items-center bg-muted rounded-full p-1 mb-4 gap-0.5">
	{#each tabs as tab (tab.key)}
		{@const Icon = tab.icon}
		<button
			type="button"
			onclick={() => list.setTab(tab.key)}
			class={cn(
				'inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-base font-medium transition-all',
				list.filters.tab === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
			)}
		>
			{#if Icon}<Icon class="w-3.5 h-3.5" />{/if}{tab.label}
		</button>
	{/each}
</div>
