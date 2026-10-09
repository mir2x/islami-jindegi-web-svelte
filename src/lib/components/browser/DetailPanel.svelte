<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import AdminEditButton from '#lib/components/shared/AdminEditButton.svelte';
	import DetailToolbar from '#lib/components/shared/DetailToolbar.svelte';

	interface Props {
		hasSelection: boolean;
		loading: boolean;
		icon: Component<{ class?: string }>;
		selectPrompt: string;
		/** Set once the detail is loaded. */
		detail: { id: string; title: string; share: string } | null;
		/** Locale-less base path of the dedicated pages, e.g. `/bayan`. */
		basePath: string;
		subtitle?: Snippet;
		children: Snippet;
	}
	let { hasSelection, loading, icon: Icon, selectPrompt, detail, basePath, subtitle, children }: Props = $props();

	let zoom = $state(100);
</script>

<div class="flex flex-col w-full min-h-0 rounded-2xl border border-border bg-card overflow-hidden print:overflow-visible print:border-none print:rounded-none">
	{#if !hasSelection}
		<div class="flex-1 flex flex-col items-center justify-center text-center p-8 print:hidden">
			<Icon class="w-14 h-14 text-muted-foreground/25 mb-4" />
			<p class="text-base text-muted-foreground">{selectPrompt}</p>
		</div>
	{:else if loading || !detail}
		<div class="p-6 space-y-4 animate-pulse">
			<div class="h-6 bg-muted rounded w-2/3"></div>
			<div class="h-3 bg-muted rounded w-1/3"></div>
			<div class="space-y-2 pt-4">
				<div class="h-3 bg-muted rounded w-full"></div>
				<div class="h-3 bg-muted rounded w-5/6"></div>
				<div class="h-3 bg-muted rounded w-4/5"></div>
			</div>
		</div>
	{:else}
		<div class="shrink-0 flex items-start justify-between gap-4 p-6 pb-4 border-b border-border/60">
			<div class="min-w-0">
				<h2 class="text-2xl font-bold text-foreground leading-snug">{detail.title}</h2>
				{#if subtitle}{@render subtitle()}{/if}
			</div>
			<DetailToolbar bind:zoom path={`${basePath}/${detail.id}`} title={detail.title} content={detail.share} showOpenPage />
		</div>
		<AdminEditButton entity={basePath.slice(1) as 'articles'} id={detail.id} />
		<div class="flex-1 min-h-0 overflow-y-auto p-6 print:overflow-visible print:h-auto" style:zoom="{zoom}%">
			{@render children()}
		</div>
	{/if}
</div>
