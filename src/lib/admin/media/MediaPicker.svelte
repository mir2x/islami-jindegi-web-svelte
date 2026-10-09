<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import Modal from '#lib/components/ui/Modal.svelte';
	import type { MediaItem, MediaType } from '#lib/types.ts';
	import Button from '../ui/Button.svelte';
	import Pagination from '../ui/Pagination.svelte';
	import { toast } from '../toast.svelte.ts';
	import { MediaBrowser } from './browser.svelte.ts';
	import DropOverlay from './DropOverlay.svelte';
	import { ACCEPT_ATTR, formatBytes } from './files.ts';
	import { fileDrop } from './file-drop.ts';
	import MediaTile from './MediaTile.svelte';
	import MediaToolbar from './MediaToolbar.svelte';
	import { UploadQueue } from './upload-queue.svelte.ts';
	import UploadPanel from './UploadPanel.svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
		onselect: (item: MediaItem) => void;
		accept?: MediaType;
	}
	let { open, onclose, onselect, accept }: Props = $props();

	// svelte-ignore state_referenced_locally
	const browser = new MediaBrowser(24, accept ?? 'all');
	let selected = $state<MediaItem | null>(null);
	let dragging = $state(false);
	let fileInput = $state<HTMLInputElement>();

	const queue = new UploadQueue({
		// svelte-ignore state_referenced_locally
		accept,
		onIdle: (uploaded, failed) => {
			// Uploads keep going if the dialog is closed mid-way; they land in the library but shouldn't fill the form.
			if (!open) return;
			// A single clean upload is almost always the file the form wanted: use it straight away.
			if (uploaded.length === 1 && failed === 0) {
				toast.success('Uploaded successfully');
				close();
				onselect(uploaded[0]);
				return;
			}
			if (uploaded.length > 0) {
				toast.success(`${uploaded.length} files uploaded: pick one to use`);
				if (browser.page === 1) browser.reload();
				else browser.page = 1;
			}
		}
	});

	// Load while open; the selection never outlives its query.
	$effect(() => {
		if (!open) return;
		void [browser.page, browser.search, browser.type];
		selected = null;
		browser.reload();
	});

	function close() {
		queue.clear();
		onclose();
	}

	const result = $derived(browser.loader.result);
	const hint = $derived(accept ? `${accept === 'document' ? 'PDF' : accept === 'image' ? 'Image' : 'Audio'} files up to 200 MB` : 'Images, audio and PDFs up to 200 MB');
</script>

<Modal {open} title="Media Library" onclose={close} class="top-4 max-w-7xl h-[92vh] max-h-[92vh] p-0">
	<div class="relative flex-1 min-h-0 flex flex-col" use:fileDrop={{ onfiles: queue.enqueue, ondrag: (d) => (dragging = d) }}>
		<DropOverlay show={dragging} {hint} />

		<div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-3 border-b shrink-0 bg-muted/30">
			<MediaToolbar {browser} only={accept} tabClass="px-3 py-1.5" inputClass="h-9" />
			{#if result && browser.loader.totalPages > 1}
				<div class="order-5 w-full sm:order-none sm:w-auto sm:flex-1 flex justify-center min-w-0 overflow-x-auto">
					<Pagination page={browser.page} totalPages={browser.loader.totalPages} siblings={1} onchange={(p) => (browser.page = p)} />
				</div>
			{/if}
			<div class="ml-auto flex items-center gap-2">
				<Button size="sm" class="gap-1.5" onclick={() => fileInput?.click()}>
					{#if queue.active > 0}<Loader2 class="w-4 h-4 animate-spin" />Uploading {queue.active}…{:else}<Plus class="w-4 h-4" />Upload new{/if}
				</Button>
				<input
					bind:this={fileInput}
					type="file"
					multiple
					class="hidden"
					accept={ACCEPT_ATTR[browser.type]}
					onchange={(e) => {
						const files = Array.from(e.currentTarget.files ?? []);
						e.currentTarget.value = '';
						if (files.length) queue.enqueue(files);
					}}
				/>
			</div>
		</div>

		<UploadPanel {queue} class="static w-auto shrink-0 rounded-none shadow-none border-x-0 border-t-0 z-auto" />

		<div class="flex-1 overflow-y-auto p-5">
			{#if browser.loader.loading && !result}
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{#each { length: 24 } as _, i (i)}<div class="aspect-square rounded-xl bg-muted animate-pulse"></div>{/each}
				</div>
			{:else if result && result.data.length === 0}
				<div class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
					<FileText class="w-12 h-12 opacity-25" />
					<p class="text-sm">{browser.search ? 'No files match your search' : 'No files uploaded yet: drag files here to upload'}</p>
				</div>
			{:else if result}
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" class:opacity-60={browser.loader.loading}>
					{#each result.data as item (item.id)}
						<MediaTile {item} size="lg" selected={selected?.id === item.id} onclick={() => (selected = selected?.id === item.id ? null : item)} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="px-4 sm:px-6 py-4 border-t shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/20 rounded-b-2xl">
			<div class="text-sm text-muted-foreground">
				{#if result}<span>{result.total.toLocaleString()} file{result.total !== 1 ? 's' : ''}</span>{/if}
				{#if selected}<span class="ml-3 text-foreground"
						><span class="font-medium">{selected.fileName}</span><span class="ml-2 text-muted-foreground">({formatBytes(selected.size)})</span></span
					>{/if}
			</div>
			<div class="flex gap-2">
				<Button variant="outline" onclick={close}>Cancel</Button>
				<Button
					disabled={!selected}
					onclick={() => {
						if (!selected) return;
						onselect(selected);
						close();
					}}>Use this file</Button
				>
			</div>
		</div>
	</div>
</Modal>
