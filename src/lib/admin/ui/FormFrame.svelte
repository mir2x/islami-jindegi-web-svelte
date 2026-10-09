<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import PublicViewButton from './PublicViewButton.svelte';

	interface Props {
		backLabel: string;
		/** Where Back / Cancel go when the tab was opened straight on this form. */
		fallback: string;
		heading: string;
		subheading?: string;
		/** Tailwind max-width class of the column. */
		width?: string;
		publicHref?: string;
		saving: boolean;
		submitLabel: string;
		onsubmit: () => void;
		children: Snippet;
	}
	let { backLabel, fallback, heading, subheading, width = 'max-w-3xl', publicHref, saving, submitLabel, onsubmit, children }: Props = $props();
</script>

<div class="{width} mx-auto px-4 sm:px-6 py-6 sm:py-8">
	<div class="mb-6">
		<div class="flex items-center justify-between mb-3">
			<button type="button" onclick={() => goBack(fallback)} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				><ArrowLeft class="w-4 h-4" /> {backLabel}</button
			>
			{#if publicHref}<PublicViewButton href={publicHref} />{/if}
		</div>
		<h1 class="text-lg font-semibold">{heading}</h1>
		{#if subheading}<p class="mt-1 text-sm text-muted-foreground">{subheading}</p>{/if}
	</div>

	<form
		class="space-y-5"
		onsubmit={(e) => {
			e.preventDefault();
			onsubmit();
		}}
	>
		{@render children()}
		<div class="flex gap-3">
			<Button type="submit" disabled={saving} class="sm:px-8">{saving ? 'Saving...' : submitLabel}</Button>
			<Button variant="outline" onclick={() => goBack(fallback)}>Cancel</Button>
		</div>
	</form>
</div>
