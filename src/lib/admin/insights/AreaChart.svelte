<script lang="ts">
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';
	import { fmt, fmtCompact, shortDay } from './format.ts';
	import type { Point } from './types.ts';

	interface Props {
		points: Point[];
		/** What one value is called in the tooltip ("readers"). */
		unit: string;
		height?: number;
	}
	let { points, unit, height = 220 }: Props = $props();

	const locale = $derived(currentLocale());
	const PAD = { top: 12, right: 12, bottom: 28, left: 44 };
	let width = $state(600);
	let hover = $state<number | null>(null);

	const max = $derived(niceMax(Math.max(1, ...points.map((p) => p.y))));
	const inner = $derived({ w: Math.max(10, width - PAD.left - PAD.right), h: height - PAD.top - PAD.bottom });
	const xAt = (i: number) => PAD.left + (points.length < 2 ? inner.w / 2 : (i / (points.length - 1)) * inner.w);
	const yAt = (v: number) => PAD.top + inner.h - (v / max) * inner.h;
	const line = $derived(points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(p.y).toFixed(1)}`).join(' '));
	const area = $derived(points.length ? `${line} L${xAt(points.length - 1).toFixed(1)},${PAD.top + inner.h} L${xAt(0).toFixed(1)},${PAD.top + inner.h} Z` : '');
	const grid = $derived([0, 0.5, 1].map((f) => ({ v: max * f, y: yAt(max * f) })));
	// Labels at both ends and the middle; more would collide on a phone.
	const ticks = $derived(points.length < 2 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1]);

	function niceMax(v: number) {
		const p = 10 ** Math.floor(Math.log10(v));
		return Math.ceil(v / p) * p;
	}
	function move(e: PointerEvent) {
		const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
		const x = e.clientX - rect.left - PAD.left;
		hover = points.length ? Math.max(0, Math.min(points.length - 1, Math.round((x / inner.w) * (points.length - 1)))) : null;
	}
</script>

<div bind:clientWidth={width} class="relative w-full select-none" style="height:{height}px">
	{#if points.length}
		<svg {width} {height} role="img" aria-label={unit} onpointermove={move} onpointerleave={() => (hover = null)} class="touch-pan-y overflow-visible">
			<defs>
				<linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.28" />
					<stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
				</linearGradient>
			</defs>
			{#each grid as g (g.y)}
				<line x1={PAD.left} x2={width - PAD.right} y1={g.y} y2={g.y} stroke="var(--border)" stroke-dasharray="3 4" />
				<text x={PAD.left - 8} y={g.y + 4} text-anchor="end" class="fill-muted-foreground text-[11px]">{fmtCompact(g.v, locale)}</text>
			{/each}
			<path d={area} fill="url(#area-fill)" />
			<path d={line} fill="none" stroke="var(--primary)" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round" />
			{#each ticks as i (i)}
				<text
					x={xAt(i)}
					y={height - 8}
					text-anchor={i === 0 && points.length > 1 ? 'start' : i === points.length - 1 && points.length > 1 ? 'end' : 'middle'}
					class="fill-muted-foreground text-[11px]"
				>
					{shortDay(points[i].x, locale)}
				</text>
			{/each}
			{#if hover !== null}
				<line x1={xAt(hover)} x2={xAt(hover)} y1={PAD.top} y2={PAD.top + inner.h} stroke="var(--muted-foreground)" stroke-opacity="0.4" />
				<circle cx={xAt(hover)} cy={yAt(points[hover].y)} r="4.5" fill="var(--background)" stroke="var(--primary)" stroke-width="2.25" />
			{/if}
		</svg>
		{#if hover !== null}
			<div
				class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md"
				style="left:{Math.min(Math.max(xAt(hover), 60), width - 60)}px; top:0"
			>
				<p class="text-muted-foreground">{shortDay(points[hover].x, locale)}</p>
				<p class="font-semibold tabular-nums">{fmt(points[hover].y, locale)} {unit}</p>
			</div>
		{/if}
	{/if}
</div>
