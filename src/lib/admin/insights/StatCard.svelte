<script lang="ts">
	import ArrowDownRight from '@lucide/svelte/icons/arrow-down-right';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import type { Component } from 'svelte';
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { fmt } from './format.ts';

	interface Props {
		label: string;
		value: string;
		/** One plain sentence under the number: what it means. */
		hint?: string;
		/** Percent change against the period before; null or undefined shows nothing. */
		trend?: number | null;
		trendLabel?: string;
		icon?: Component<{ class?: string }>;
		class?: string;
	}
	let { label, value, hint, trend, trendLabel, icon: Icon, class: className }: Props = $props();
	const locale = $derived(currentLocale());
	const up = $derived((trend ?? 0) >= 0);
</script>

<div class={cn('flex flex-col gap-3 rounded-xl border bg-card p-5', className)}>
	<div class="flex items-center justify-between gap-2">
		<p class="text-sm font-medium text-muted-foreground">{label}</p>
		{#if Icon}<span class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon class="size-4" /></span>{/if}
	</div>
	<p class="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{value}</p>
	<div class="flex flex-col gap-1">
		{#if trend !== null && trend !== undefined}
			<p class={cn('inline-flex items-center gap-1 text-sm font-medium', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
				{#if up}<ArrowUpRight class="size-4" />{:else}<ArrowDownRight class="size-4" />{/if}
				{fmt(Math.abs(trend), locale)}%
				{#if trendLabel}<span class="font-normal text-muted-foreground">{trendLabel}</span>{/if}
			</p>
		{/if}
		{#if hint}<p class="text-sm leading-snug text-muted-foreground">{hint}</p>{/if}
	</div>
</div>
