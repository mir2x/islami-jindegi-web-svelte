<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import BookMarked from '@lucide/svelte/icons/book-marked';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Globe from '@lucide/svelte/icons/globe';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Tag from '@lucide/svelte/icons/tag';
	import Users from '@lucide/svelte/icons/users';
	import { page } from '$app/state';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { BookDetail } from '#lib/types.ts';
	import { api } from '../api.ts';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import PublicViewButton from '../ui/PublicViewButton.svelte';
	import StatusPill from '../ui/StatusPill.svelte';
	import ChapterRow from './ChapterRow.svelte';

	const t = useT('BooksAdmin');
	const tc = useT('Common');
	const id = $derived(page.params.id!);

	let book = $state<BookDetail | null>(null);
	let loading = $state(true);
	let expandAll = $state(false);
	let deleting = $state<{ id: string; title: string; type: 'chapter' | 'subchapter' } | null>(null);
	let busy = $state(false);

	async function load() {
		try {
			book = await api.get<BookDetail>(`/api/books/${id}/admin`);
		} catch {
			book = null;
		} finally {
			loading = false;
		}
	}
	$effect(() => void load());

	const totalSubs = $derived(book?.chapters.reduce((sum, c) => sum + c.subChapters.length, 0) ?? 0);

	async function remove() {
		if (!deleting) return;
		busy = true;
		try {
			await api.delete(`/api/${deleting.type === 'chapter' ? 'chapters' : 'subchapters'}/${deleting.id}`);
			toast.success(t('itemDeletedToast', { type: deleting.type === 'chapter' ? t('typeChapter') : t('typeSubchapter') }));
			deleting = null;
			await load();
		} catch {
			toast.error(t('deleteFailedLinked'));
		} finally {
			busy = false;
		}
	}
</script>

{#if loading}
	<div class="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
		<Skeleton class="h-5 w-32" />
		<div class="p-4 sm:p-5 border border-border rounded-xl space-y-4 bg-card shadow-sm">
			<div class="flex items-center gap-3"><Skeleton class="h-7 w-1/3" /><Skeleton class="h-5 w-20 rounded-full" /></div>
			<div class="flex flex-wrap gap-4"><Skeleton class="h-4 w-24" /><Skeleton class="h-4 w-24" /><Skeleton class="h-4 w-32" /></div>
		</div>
		<div class="space-y-3 pt-4">
			{#each { length: 5 } as _, i (i)}<Skeleton class="h-14 w-full rounded-xl" />{/each}
		</div>
	</div>
{:else if !book}
	<div class="p-4 sm:p-8 text-center">
		<p class="text-muted-foreground">{t('bookNotFound')}</p>
		<Button variant="outline" class="mt-4" onclick={() => goBack('/admin/books')}>{t('goBack')}</Button>
	</div>
{:else}
	<div class="p-4 sm:p-8 max-w-5xl mx-auto">
		<div class="flex items-center justify-between mb-6">
			<a href={localePath('/admin/books')} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				><ArrowLeft class="w-4 h-4" /> {t('title')}</a
			>
			<div class="flex items-center gap-2">
				<PublicViewButton href="/books/{id}" />
				<Button variant="outline" class="gap-2" onclick={(e) => adminNavigate(`/admin/books/${id}/edit`, e)}><Pencil class="w-3.5 h-3.5" /> {t('editBook')}</Button>
			</div>
		</div>

		<div class="mb-6 p-4 sm:p-5 bg-card border border-border rounded-xl shadow-sm">
			<div class="flex flex-col gap-3.5">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="flex items-center gap-3">
						<h1 class="text-xl sm:text-2xl font-bold leading-tight">{book.title}</h1>
						<StatusPill published={book.published} labels={{ published: t('published'), draft: t('draft') }} />
					</div>
					{#if book.documentUrl}
						<a
							href={book.documentUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-primary/10 px-2.5 py-1.5 rounded-md"
							><ExternalLink class="w-3.5 h-3.5" /> {t('openDocument')}</a
						>
					{/if}
				</div>
				{#if book.excerpt}<p class="text-muted-foreground text-sm leading-relaxed">{book.excerpt}</p>{/if}

				<div class="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-muted-foreground">
					<div class="flex items-center gap-1.5"><Globe class="w-3.5 h-3.5 shrink-0" /><span class="text-foreground">{book.language}</span></div>
					{#if book.publisher}<div class="flex items-center gap-1.5"><BookMarked class="w-3.5 h-3.5 shrink-0" /><span class="text-foreground">{book.publisher}</span></div>{/if}
					{#if book.price}<div>{t('priceLabelShort')} <span class="text-foreground">{book.price}</span></div>{/if}
					{#if book.publishedAt}<div>
							{t('publishedLabelShort')}
							<span class="text-foreground">{new Date(book.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
						</div>{/if}
					<div>{t('positionLabelShort')} <span class="text-foreground">{book.position}</span></div>
					{#if book.authors.length > 0}
						<div class="flex items-center gap-1.5">
							<Users class="w-3.5 h-3.5 shrink-0" />
							<div class="flex flex-wrap gap-1">
								{#each book.authors as a (a.id)}<Badge variant="secondary" class="text-[11px]">{a.name}</Badge>{/each}
							</div>
						</div>
					{/if}
					{#if book.categories.length > 0}
						<div class="flex items-center gap-1.5">
							<Tag class="w-3.5 h-3.5 shrink-0" />
							<div class="flex flex-wrap gap-1">
								{#each book.categories as c (c.id)}<Badge class="text-[11px]">{c.title}</Badge>{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
				<div>
					<h2 class="text-lg font-semibold">{t('chaptersHeading')}</h2>
					<p class="text-sm text-muted-foreground">{t('chapterCount', { count: book.chapters.length })}{totalSubs > 0 ? ` · ${t('subchapterCount', { count: totalSubs })}` : ''}</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<Button variant="outline" size="sm" href={localePath(`/admin/subchapters/new?bookId=${id}`)} class="gap-1.5 text-xs"
						><Plus class="w-3.5 h-3.5" /> {t('addSubchapter')}</Button
					>
					<Button variant="outline" size="sm" href={localePath(`/admin/chapters/new?bookId=${id}`)} class="gap-1.5 text-xs"><Plus class="w-3.5 h-3.5" /> {t('addChapter')}</Button>
					{#if book.chapters.length > 0}<Button variant="ghost" size="sm" class="text-muted-foreground text-xs" onclick={() => (expandAll = !expandAll)}
							>{expandAll ? t('collapseAll') : t('expandAll')}</Button
						>{/if}
				</div>
			</div>

			{#if book.chapters.length === 0}
				<div class="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl text-center">
					<div class="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3"><BookOpen class="w-5 h-5 text-muted-foreground/50" /></div>
					<p class="font-medium text-foreground">{t('noChaptersTitle')}</p>
					<p class="text-sm text-muted-foreground mt-1">{t('noChaptersSubtitle')}</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each book.chapters as chapter, i (chapter.id)}<ChapterRow {chapter} index={i + 1} forceExpanded={expandAll} bookId={id} ondelete={(item) => (deleting = item)} />{/each}
				</div>
			{/if}
		</div>

		<ConfirmDialog
			open={!!deleting}
			title={t('deleteTitle', { type: deleting?.type === 'chapter' ? t('typeChapter') : t('typeSubchapter') })}
			{busy}
			confirmLabel={tc('delete')}
			busyLabel={t('deleting')}
			onconfirm={remove}
			oncancel={() => (deleting = null)}
		>
			<strong>{deleting?.title}</strong> will be permanently deleted. This cannot be undone.
		</ConfirmDialog>
	</div>
{/if}
