<script lang="ts">
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import { GRADE_STYLES } from './common.ts';

	let { gradeBn, gradeEn = null, class: className }: { gradeBn: string | null; gradeEn?: string | null; class?: string } = $props();
	const label = $derived((currentLocale() === 'en' ? gradeEn || gradeBn : gradeBn || gradeEn)?.trim());
	const style = $derived(GRADE_STYLES.find((g) => g.match.test(`${gradeEn ?? ''} ${gradeBn ?? ''}`))?.className ?? 'bg-muted text-muted-foreground border-border');
</script>

{#if label}<span class={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold', style, className)}>{label}</span>{/if}
