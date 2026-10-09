import { cn } from '#lib/utils.ts';

/** Title line of a list row: primary colour when selected, on hover otherwise. */
export const rowTitle = (selected: boolean, lines: 1 | 2 = 2) =>
	cn(
		'text-base font-semibold leading-snug transition-colors',
		lines === 1 ? 'line-clamp-1' : 'line-clamp-2',
		selected ? 'text-primary' : 'text-foreground group-hover:text-primary'
	);
