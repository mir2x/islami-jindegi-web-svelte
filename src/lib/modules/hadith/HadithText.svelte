<script lang="ts">
	import { cn } from '#lib/utils.ts';
	import { hasMarkup } from './common.ts';

	let { text, class: className, style }: { text: string; class?: string; style?: string } = $props();
</script>

{#if hasMarkup(text)}
	<div class={cn('prose-content', className)} {style}>{@html text}</div>
{:else}
	<p class={cn('whitespace-pre-line', className)} {style}>{text}</p>
{/if}
