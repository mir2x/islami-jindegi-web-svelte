<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { ChapterDetail } from '#lib/types.ts';
	import { editorTab } from '../editor-tab.svelte.ts';
	import RichEditor from '../editor/RichEditor.svelte';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import PublicViewButton from '../ui/PublicViewButton.svelte';
	import Tabs from '../ui/Tabs.svelte';
	import { saveForm } from '../ui/save.ts';
	import DeleteItemButton from './DeleteItemButton.svelte';
	import BookPicker from './BookPicker.svelte';

	interface Props {
		chapter?: ChapterDetail | null;
		defaultBookId?: string;
	}
	let { chapter = null, defaultBookId = '' }: Props = $props();

	const t = useT('ChapterForm');
	const tc = useT('Common');
	const tab = editorTab(['general', 'content']);
	// svelte-ignore state_referenced_locally
	let title = $state(chapter?.title ?? '');
	// svelte-ignore state_referenced_locally
	let body = $state(chapter?.body ?? '');
	// svelte-ignore state_referenced_locally
	let position = $state(chapter ? String(chapter.position) : '');
	// svelte-ignore state_referenced_locally
	let bookId = $state(chapter?.bookId ?? defaultBookId);
	let saving = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return toast.error(t('titleRequired'));
		if (!chapter && !bookId) {
			tab.set('general');
			return toast.error(t('bookRequired'));
		}
		saving = true;
		const ok = await saveForm({
			apiPath: chapter ? '/api/chapters' : `/api/books/${bookId}/chapters`,
			id: chapter?.id,
			name: 'Chapter',
			fallback: '/admin/books',
			stay: true,
			redirect: (created) => `/admin/chapters/${created.id}/edit`,
			failMessage: tc('somethingWentWrong'),
			payload: { title: title.trim(), body: body || null, position: position ? parseInt(position) : undefined }
		});
		saving = false;
		if (ok) window.dispatchEvent(new Event('book-hierarchy:refresh'));
	}
</script>

<div class="w-full p-6 lg:p-8">
	<div class="flex items-center justify-between mb-4">
		<button type="button" onclick={() => goBack('/admin/books')} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			><ArrowLeft class="w-4 h-4" /> {tc('back')}</button
		>
		{#if chapter}<PublicViewButton href="/books/{chapter.bookId}?chapter={chapter.id}" />{/if}
	</div>

	<form onsubmit={submit}>
		<Tabs
			tabs={[
				{ id: 'general', label: 'General' },
				{ id: 'content', label: 'Content' }
			]}
			value={tab.current}
			onchange={tab.set}
			class="mb-6"
		/>
		<div class="space-y-4">
			{#if tab.current === 'general'}
				<Card title={t('basicInformation')}>
					{#if chapter}
						<Field label={t('bookLabel')}><p class="text-sm font-medium text-foreground">{chapter.bookTitle}</p></Field>
					{:else}
						<Field label={t('bookLabel')} required
							><BookPicker bind:value={bookId} placeholder={t('selectBookPlaceholder')} searchPlaceholder={t('searchBooksPlaceholder')} emptyText={t('noBooksFound')} /></Field
						>
					{/if}
					<Field label={t('titleLabel')} required><input bind:value={title} placeholder={t('chapterTitlePlaceholder')} class={inputCls} /></Field>
					<Field label={t('positionLabel')}><input type="number" min="1" bind:value={position} placeholder={t('autoPlaceholder')} class={inp('w-40')} /></Field>
				</Card>
			{:else}
				<Card title={t('content')}><RichEditor bind:value={body} placeholder={t('chapterContentPlaceholder')} class="h-[500px]" /></Card>
			{/if}
		</div>

		<div class="flex flex-wrap items-center justify-end gap-3 mt-6">
			{#if chapter}<DeleteItemButton type="chapter" id={chapter.id} title={chapter.title} nextHref={`/admin/chapters?bookId=${chapter.bookId}`} />{/if}
			<Button variant="outline" onclick={() => goBack('/admin/books')}>{tc('cancel')}</Button>
			<Button type="submit" disabled={saving} class="flex-1 sm:flex-none sm:px-8">{saving ? t('saving') : chapter ? t('updateChapter') : t('createChapter')}</Button>
		</div>
	</form>
</div>
