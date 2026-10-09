<script lang="ts">
	import FileAudio from '@lucide/svelte/icons/file-audio';
	import FileText from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Library from '@lucide/svelte/icons/library';
	import X from '@lucide/svelte/icons/x';
	import type { MediaItem, MediaType } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import Button from '../ui/Button.svelte';
	import MediaPicker from './MediaPicker.svelte';

	interface Props {
		value: string;
		accept?: MediaType;
		placeholder?: string;
		compact?: boolean;
	}
	let { value = $bindable(), accept, placeholder, compact = false }: Props = $props();

	const ICONS = { image: ImageIcon, audio: FileAudio, document: FileText };
	let pickerOpen = $state(false);
	let picked = $state<MediaItem | null>(null);

	const Icon = $derived(accept ? ICONS[accept] : FileText);
	const asImage = $derived(accept === 'image' || (!accept && value && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(value)));
	// The picked item only describes the value while the value is still its URL.
	const name = $derived(picked && picked.url === value ? picked.fileName : decodeURIComponent(value.split('/').pop() ?? value));
</script>

<div class="rounded-xl border bg-card overflow-hidden">
	{#if value}
		<div class="relative">
			{#if asImage}
				<img src={value} alt="" class={compact ? 'w-full max-h-36 object-contain bg-muted/30' : 'w-full max-h-52 object-cover'} />
				{#if compact}<div class="px-3 py-1.5 border-t bg-muted/20"><p class="text-xs text-muted-foreground truncate">{name}</p></div>{/if}
			{:else}
				<div class="flex items-center gap-3 px-4 py-5 bg-muted/40">
					<div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0"><Icon class="w-5 h-5 text-muted-foreground/60" /></div>
					<span class="text-sm text-foreground truncate flex-1 font-medium">{name}</span>
				</div>
			{/if}
			<button
				type="button"
				aria-label="Remove"
				onclick={() => (value = '')}
				class="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors shadow-sm"
				><X class="w-3.5 h-3.5" /></button
			>
		</div>
	{:else}
		<div class={cn('flex flex-col items-center justify-center gap-2 bg-muted/20', compact ? 'py-6' : 'py-10')}>
			<Icon class={cn('text-muted-foreground/30', compact ? 'w-7 h-7' : 'w-9 h-9')} />
			<p class="text-sm text-muted-foreground">{placeholder ?? 'No file selected'}</p>
		</div>
	{/if}
	<div class="flex items-center gap-2 px-3 py-2.5 border-t bg-muted/10">
		<Button variant="outline" size="sm" class="gap-1.5 h-8" onclick={() => (pickerOpen = true)}><Library class="w-3.5 h-3.5" />{value ? 'Change' : 'Select from library'}</Button>
		{#if value}<Button variant="ghost" size="sm" class="h-8 text-muted-foreground hover:text-destructive" onclick={() => (value = '')}>Remove</Button>{/if}
	</div>
</div>

<MediaPicker
	open={pickerOpen}
	{accept}
	onclose={() => (pickerOpen = false)}
	onselect={(item) => {
		picked = item;
		value = item.url;
	}}
/>
