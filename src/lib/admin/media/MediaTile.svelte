<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import FileAudio from '@lucide/svelte/icons/file-audio';
	import FileText from '@lucide/svelte/icons/file-text';
	import type { MediaItem } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		item: MediaItem;
		selected: boolean;
		onclick: () => void;
		/** `lg` = picker dialog tiles (bigger icon and label), `sm` = library page. */
		size?: 'sm' | 'lg';
	}
	let { item, selected, onclick, size = 'sm' }: Props = $props();
	const Icon = $derived(item.type === 'audio' ? FileAudio : FileText);
</script>

<button
	type="button"
	{onclick}
	class={cn(
		'relative aspect-square rounded-xl border-2 overflow-hidden transition-all group',
		selected ? 'border-primary ring-2 ring-primary/25' : 'border-transparent hover:border-muted-foreground/30 bg-muted'
	)}
>
	{#if item.type === 'image'}
		<img src={item.url} alt={item.fileName} loading="lazy" decoding="async" class="w-full h-full object-cover" />
	{:else}
		<div class={cn('w-full h-full flex flex-col items-center justify-center bg-muted', size === 'lg' ? 'gap-3 p-4' : 'gap-1.5 p-2')}>
			<Icon class={cn('text-muted-foreground/50', size === 'lg' ? 'w-14 h-14' : 'w-8 h-8')} />
			<span class={cn('text-muted-foreground leading-tight line-clamp-2 text-center w-full', size === 'lg' ? 'text-sm' : 'text-[10px]')}>{item.fileName}</span>
		</div>
	{/if}
	{#if !selected}<div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>{/if}
	{#if selected && size === 'lg'}
		<div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow"><Check class="w-3.5 h-3.5 text-primary-foreground" /></div>
	{/if}
</button>
