<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { goto } from '$app/navigation';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';

	interface Props {
		type: 'chapter' | 'subchapter';
		id: string;
		title: string;
		/** Where to land afterwards: another page of the chapter editor, so the sidebar stays put. */
		nextHref: string;
	}
	let { type, id, title, nextHref }: Props = $props();

	const t = useT('BooksAdmin');
	const tc = useT('Common');
	let open = $state(false);
	let busy = $state(false);
	const typeLabel = $derived(type === 'chapter' ? t('typeChapter') : t('typeSubchapter'));

	/** Delete button + confirmation for the chapter / subchapter edit forms; lands on `nextHref` afterwards. */
	async function remove() {
		busy = true;
		try {
			await api.delete(`/api/${type === 'chapter' ? 'chapters' : 'subchapters'}/${id}`);
			toast.success(t('itemDeletedToast', { type: typeLabel }));
			window.dispatchEvent(new Event('book-hierarchy:refresh'));
			open = false;
			await goto(localePath(nextHref), { replaceState: true });
		} catch {
			toast.error(t('deleteFailedLinked'));
		} finally {
			busy = false;
		}
	}
</script>

<Button variant="destructive" onclick={() => (open = true)} class="gap-1.5"><Trash2 class="w-4 h-4" /> {tc('delete')}</Button>
<ConfirmDialog {open} title={t('deleteTitle', { type: typeLabel })} {busy} confirmLabel={tc('delete')} busyLabel={t('deleting')} onconfirm={remove} oncancel={() => (open = false)}>
	<strong>{title}</strong> will be permanently deleted. This cannot be undone.
</ConfirmDialog>
