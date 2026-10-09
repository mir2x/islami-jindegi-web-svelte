<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { Chapter, SubChapterDetail } from '#lib/types.ts';
	import { api } from '../api.ts';
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
	import BookPicker from './BookPicker.svelte';
	import ChapterTreePicker from './ChapterTreePicker.svelte';

	interface Props {
		subChapter?: SubChapterDetail | null;
		defaultBookId?: string;
	}
	let { subChapter = null, defaultBookId = '' }: Props = $props();

	const t = useT('SubChapterForm');
	const tc = useT('Common');
	const tab = editorTab(['general', 'content']);
	// svelte-ignore state_referenced_locally
	let title = $state(subChapter?.title ?? '');
	// svelte-ignore state_referenced_locally
	let body = $state(subChapter?.body ?? '');
	// svelte-ignore state_referenced_locally
	let position = $state(subChapter ? String(subChapter.position) : '');
	// svelte-ignore state_referenced_locally
	let bookId = $state(subChapter?.bookId ?? defaultBookId);
	// svelte-ignore state_referenced_locally
	let chapterId = $state(subChapter?.chapterId ?? '');
	// svelte-ignore state_referenced_locally
	let parentId = $state(subChapter?.parentSubChapterId ?? '');
	let saving = $state(false);
	// Chapters are tagged with the book they were fetched for, so another (or cleared) book derives to empty.
	let loaded = $state<{ bookId: string; chapters: Chapter[] } | null>(null);

	$effect(() => {
		const id = bookId;
		if (!id) return;
		let cancelled = false;
		api.get<Chapter[]>(`/api/books/${id}/chapters`).then((chapters) => !cancelled && (loaded = { bookId: id, chapters }));
		return () => (cancelled = true);
	});

	const chapters = $derived(bookId && loaded?.bookId === bookId ? loaded.chapters : []);
	const subs = $derived(chapters.flatMap((c) => c.subChapters));
	const parentLabel = $derived(
		parentId
			? (subs.find((s) => s.id === parentId)?.title ?? t('selectParentPlaceholder'))
			: chapterId
				? (chapters.find((c) => c.id === chapterId)?.title ?? subChapter?.chapterTitle ?? t('selectParentPlaceholder'))
				: t('selectParentPlaceholder')
	);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return toast.error(t('titleRequired'));
		if (!chapterId) {
			tab.set('general');
			return toast.error(t('parentChapterRequired'));
		}
		saving = true;
		await saveForm({
			apiPath: '/api/subchapters',
			id: subChapter?.id,
			name: 'Subchapter',
			fallback: '/admin/books',
			failMessage: tc('somethingWentWrong'),
			payload: { title: title.trim(), body: body || null, position: position ? parseInt(position) : undefined, chapterId, parentSubChapterId: parentId || null }
		});
		saving = false;
	}
</script>

<div class="w-full p-6 lg:p-8">
	<div class="flex items-center justify-between mb-4">
		<button type="button" onclick={() => goBack('/admin/books')} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			><ArrowLeft class="w-4 h-4" /> {tc('back')}</button
		>
		{#if subChapter}<PublicViewButton href="/books/{subChapter.bookId}?chapter={subChapter.chapterId}&sub={subChapter.id}" />{/if}
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
					<Field label={t('bookLabel')} required>
						<BookPicker
							bind:value={bookId}
							placeholder={t('selectBookPlaceholder')}
							searchPlaceholder={t('searchBooksPlaceholder')}
							emptyText={t('noBooksFound')}
							onchange={() => {
								chapterId = '';
								parentId = '';
							}}
						/>
					</Field>
					<Field label={t('parentLabel')} required>
						<ChapterTreePicker
							bookChapters={chapters}
							selectedChapterId={chapterId}
							selectedSubId={parentId || null}
							onselect={(c, s) => {
								chapterId = c;
								parentId = s ?? '';
							}}
							disabled={!bookId}
							triggerLabel={parentLabel}
							title={t('selectParentPlaceholder')}
							excludeId={subChapter?.id}
						/>
					</Field>
					<Field label={t('titleLabel')} required><input bind:value={title} placeholder={t('subchapterTitlePlaceholder')} class={inputCls} /></Field>
					<Field label={t('positionLabel')}><input type="number" min="1" bind:value={position} placeholder={t('autoPlaceholder')} class={inp('w-40')} /></Field>
				</Card>
			{:else}
				<Card title={t('content')}><RichEditor bind:value={body} placeholder={t('subchapterContentPlaceholder')} class="h-[500px]" /></Card>
			{/if}
		</div>

		<div class="flex gap-3 mt-6">
			<Button type="submit" disabled={saving} class="flex-1 sm:flex-none sm:px-8">{saving ? t('saving') : subChapter ? t('updateSubchapter') : t('createSubchapter')}</Button>
			<Button variant="outline" onclick={() => goBack('/admin/books')}>{tc('cancel')}</Button>
		</div>
	</form>
</div>
