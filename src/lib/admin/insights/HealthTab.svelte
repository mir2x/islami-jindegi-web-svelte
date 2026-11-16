<script lang="ts">
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle from '@lucide/svelte/icons/circle-check';
	import XCircle from '@lucide/svelte/icons/circle-x';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import Card from '../ui/Card.svelte';
	import AreaChart from './AreaChart.svelte';
	import type { Insights, Level } from './types.ts';

	let { data }: { data: Insights } = $props();
	const t = useT('Insights');
	const h = $derived(data.health);
	const tone: Record<Level, string> = {
		ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
		warn: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
		bad: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
	};
	const dot: Record<Level, string> = { ok: 'bg-emerald-500', warn: 'bg-amber-500', bad: 'bg-red-500' };
	const Icon = { ok: CheckCircle, warn: AlertTriangle, bad: XCircle };
	const Banner = $derived(Icon[h.level]);
</script>

<div class={cn('flex items-center gap-4 rounded-xl border p-5', tone[h.level])}>
	<Banner class="size-9 shrink-0" />
	<div>
		<p class="text-xl font-semibold">{t(`status.${h.level}`)}</p>
		<p class="text-sm opacity-80">{t(`status.${h.level}Hint`)}</p>
	</div>
</div>

<div class="mt-4 grid gap-4 lg:grid-cols-2">
	<Card title={t('checks')}>
		<ul class="divide-y">
			{#each h.checks as c (c.id)}
				<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
					<span class={cn('size-2.5 shrink-0 rounded-full', dot[c.level])}></span>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-medium">{t(`check.${c.id}`)}</p>
						<p class="text-sm text-muted-foreground">{t(`checkHint.${c.id}`)}</p>
					</div>
					<span class="shrink-0 text-sm font-semibold tabular-nums">{c.id === 'services' || c.id === 'backup' ? t(`value.${c.value}`) : c.value}</span>
				</li>
			{/each}
		</ul>
	</Card>
	<Card title={t('errorsPerDay')}>
		<AreaChart points={h.errorsByDay} unit={t('unitErrors')} />
		<p class="text-sm text-muted-foreground">{t('errorsNote')}</p>
	</Card>
</div>
