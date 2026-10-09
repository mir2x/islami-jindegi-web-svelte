<script lang="ts">
	import ImageIcon from '@lucide/svelte/icons/image';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import type { MediaItem } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Pagination from '../ui/Pagination.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import { MediaBrowser } from './browser.svelte.ts';
	import DropOverlay from './DropOverlay.svelte';
	import { ACCEPT_ATTR } from './files.ts';
	import { fileDrop } from './file-drop.ts';
	import MediaDetail from './MediaDetail.svelte';
	import MediaTile from './MediaTile.svelte';
	import MediaToolbar from './MediaToolbar.svelte';
	import { UploadQueue } from './upload-queue.svelte.ts';
	import UploadPanel from './UploadPanel.svelte';

	const browser = new MediaBrowser(36);
	let selected = $state<MediaItem | null>(null);
	let deleting = $state<MediaItem | null>(null);
	let deleteBusy = $state(false);
	let dragging = $state(false);
	let fileInput = $state<HTMLInputElement>();

	const queue = new UploadQueue({ onIdle: (uploaded) => uploaded.length > 0 && browser.reload() });

	$effect(() => {
		void [browser.page, browser.search, browser.type];
		browser.reload();
	});

	const result = $derived(browser.loader.result);

	async function confirmDelete() {
		if (!deleting) return;
		deleteBusy = true;
		try {
			await api.delete(`/api/media/${deleting.id}`);
			toast.success('Deleted');
			if (selected?.id === deleting.id) selected = null;
			deleting = null;
			browser.reload();
		} catch {
			toast.error('Failed to delete');
		} finally {
			deleteBusy = false;
		}
	}
</script>

<div class="relative h-full flex overflow-hidden" use:fileDrop={{ onfiles: queue.enqueue, ondrag: (d) => (dragging = d) }}>
	<DropOverlay show={dragging} hint="Images, audio and PDFs up to 200 MB" />

	<div class="flex-1 flex flex-col overflow-hidden">
		<div class="shrink-0 px-4 sm:px-8 pt-8 pb-4 bg-background">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
				<div>
					<h1 class="text-2xl font-bold tracking-tight">Media Library</h1>
					<p class="mt-1 text-sm text-muted-foreground">
						{#if result}<span class="font-semibold text-foreground">{result.total.toLocaleString()}</span> files{:else}Loading...{/if}
						<span class="hidden sm:inline"> · drag and drop files anywhere here to upload</span>
					</p>
				</div>
				<Button class="gap-2 shadow-sm" onclick={() => fileInput?.click()}>
					{#if queue.active > 0}<Loader2 class="w-4 h-4 animate-spin" /> Uploading {queue.active}…{:else}<Plus class="w-4 h-4" /> Upload files{/if}
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
			<div class="flex flex-wrap items-center gap-3"><MediaToolbar {browser} /></div>
		</div>

		<div class="flex-1 overflow-y-auto px-4 sm:px-8 pb-6">
			{#if browser.loader.loading && !result}
				<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
					{#each { length: 36 } as _, i (i)}<Skeleton class="aspect-square rounded-xl" />{/each}
				</div>
			{:else if result && result.data.length === 0}
				<div class="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
					<div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center"><ImageIcon class="w-7 h-7 opacity-30" /></div>
					<p class="font-medium">No files found</p>
					<p class="text-sm">{browser.search ? 'Try a different search' : 'Upload your first file'}</p>
				</div>
			{:else if result}
				<div class={cn('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3', browser.loader.loading && 'opacity-60')}>
					{#each result.data as item (item.id)}
						<MediaTile {item} selected={selected?.id === item.id} onclick={() => (selected = selected?.id === item.id ? null : item)} />
					{/each}
				</div>
			{/if}
			<div class="my-10"><Pagination page={browser.page} totalPages={browser.loader.totalPages} onchange={(p) => (browser.page = p)} /></div>
		</div>
	</div>

	<!-- A fixed full-screen overlay on mobile, a static side panel from sm: up. -->
	<div
		class={cn(
			'w-full sm:w-[36rem] shrink-0 border-l bg-card flex flex-col transition-all duration-200',
			selected ? 'translate-x-0 fixed inset-0 z-30 sm:static sm:z-auto' : 'translate-x-full absolute right-0 inset-y-0 pointer-events-none opacity-0'
		)}
	>
		{#if selected}
			<MediaDetail
				item={selected}
				onclose={() => (selected = null)}
				ondelete={() => (deleting = selected)}
				onsaved={(updated) => {
					selected = updated;
					browser.reload();
				}}
			/>
		{/if}
	</div>

	<ConfirmDialog open={!!deleting} title="Delete file?" busy={deleteBusy} onconfirm={confirmDelete} oncancel={() => (deleting = null)}>
		<strong>{deleting?.fileName}</strong> will be permanently deleted from storage and cannot be recovered. Any content still referencing this URL will show broken links.
	</ConfirmDialog>
	<UploadPanel {queue} />
</div>
