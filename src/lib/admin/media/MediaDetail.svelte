<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import FileAudio from '@lucide/svelte/icons/file-audio';
	import FileText from '@lucide/svelte/icons/file-text';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';
	import type { MediaItem } from '#lib/types.ts';
	import { api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import { formatBytes } from './files.ts';

	interface Props {
		item: MediaItem;
		onclose: () => void;
		/** After a successful save: the updated item. */
		onsaved: (item: MediaItem) => void;
		ondelete: () => void;
	}
	let { item, onclose, onsaved, ondelete }: Props = $props();

	let editing = $state(false);
	let name = $state('');
	let url = $state('');
	let saving = $state(false);

	// A different file selected: leave edit mode.
	$effect(() => {
		void item.id;
		editing = false;
	});

	function startEdit() {
		name = item.fileName;
		url = item.url;
		editing = true;
	}

	async function save() {
		saving = true;
		try {
			const updated = await api.patch<MediaItem>(`/api/media/${item.id}`, { fileName: name, url });
			editing = false;
			toast.success('Saved');
			onsaved(updated);
		} catch {
			toast.error('Failed to save');
		} finally {
			saving = false;
		}
	}

	async function copyUrl() {
		await navigator.clipboard.writeText(item.url);
		toast.success('URL copied');
	}

	const label = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1';
</script>

<div class="sm:hidden flex items-center justify-between px-4 py-3 border-b shrink-0">
	<span class="text-sm font-semibold">File details</span>
	<button type="button" aria-label="Close" onclick={onclose} class="text-muted-foreground hover:text-foreground transition-colors"><X class="w-5 h-5" /></button>
</div>

<div class="aspect-video bg-muted flex items-center justify-center overflow-hidden shrink-0">
	{#if item.type === 'image'}
		<img src={item.url} alt={item.fileName} class="w-full h-full object-contain" />
	{:else if item.type === 'audio'}
		<div class="flex flex-col items-center gap-2 w-full">
			<FileAudio class="w-12 h-12 text-muted-foreground/40" />
			<!-- svelte-ignore a11y_media_has_caption -->
			<audio controls class="w-full px-2" src={item.url}></audio>
		</div>
	{:else}
		<div class="flex flex-col items-center gap-2"><FileText class="w-12 h-12 text-muted-foreground/40" /><span class="text-xs text-muted-foreground">PDF Document</span></div>
	{/if}
</div>

<div class="flex-1 overflow-y-auto p-4 space-y-4">
	<div>
		<p class={label}>File name</p>
		{#if editing}<input bind:value={name} class={inp('text-sm')} />{:else}<p class="text-sm font-medium break-all">{item.fileName}</p>{/if}
	</div>
	<div class="grid grid-cols-2 gap-3">
		<div>
			<p class={label}>Type</p>
			<p class="text-sm capitalize">{item.type}</p>
		</div>
		<div>
			<p class={label}>Size</p>
			<p class="text-sm">{formatBytes(item.size)}</p>
		</div>
	</div>
	{#if item.width && item.height}<div>
			<p class={label}>Dimensions</p>
			<p class="text-sm">{item.width} × {item.height}px</p>
		</div>{/if}
	<div>
		<p class={label}>Uploaded</p>
		<p class="text-sm">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
	</div>
	<div>
		<p class={label}>URL</p>
		{#if editing}<input bind:value={url} class={inp('text-xs font-mono')} />{:else}<p class="text-xs text-muted-foreground break-all bg-muted rounded-md px-2 py-1.5 font-mono">
				{item.url}
			</p>{/if}
	</div>
</div>

<div class="p-4 border-t flex flex-col gap-2 shrink-0">
	{#if editing}
		<Button size="sm" class="w-full" onclick={save} disabled={saving}
			>{#if saving}<Loader2 class="w-3.5 h-3.5 animate-spin" />{:else}Save changes{/if}</Button
		>
		<Button variant="outline" size="sm" class="w-full" onclick={() => (editing = false)} disabled={saving}>Cancel</Button>
	{:else}
		<Button variant="outline" size="sm" class="gap-1.5 w-full" onclick={startEdit}><Pencil class="w-3.5 h-3.5" /> Edit</Button>
		<Button variant="outline" size="sm" class="gap-1.5 w-full" onclick={copyUrl}><Copy class="w-3.5 h-3.5" /> Copy URL</Button>
		<Button variant="outline" size="sm" class="gap-1.5 w-full text-destructive hover:text-destructive hover:border-destructive/50" onclick={ondelete}
			><Trash2 class="w-3.5 h-3.5" /> Delete file</Button
		>
	{/if}
</div>
