<script lang="ts">
	import { currentLocale, localePath } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';

	let { categories, class: className, small = false }: { categories: { id: string; title: string }[]; class?: string; small?: boolean } = $props();
</script>

{#if categories.length > 0}
	<div class={cn('flex flex-wrap gap-1.5', className)}>
		{#each categories as c (c.id)}
			<a
				href={localePath(`/topics/${c.id}`, currentLocale())}
				class={cn('px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors', small ? 'text-xs' : 'text-sm')}>{c.title}</a
			>
		{/each}
	</div>
{/if}
