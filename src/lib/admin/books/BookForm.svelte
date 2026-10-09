<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { onMount } from 'svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { authorsForModule, categoriesForModule } from '#lib/modules.ts';
	import type { BookDetail } from '#lib/types.ts';
	import { lookups } from '../lookups.svelte.ts';
	import MediaField from '../media/MediaField.svelte';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import Checkbox from '../ui/Checkbox.svelte';
	import { inputCls, textareaCls } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import MultiPicker from '../ui/MultiPicker.svelte';
	import PublicViewButton from '../ui/PublicViewButton.svelte';
	import Select from '../ui/Select.svelte';
	import { saveForm } from '../ui/save.ts';

	let { book = null }: { book?: BookDetail | null } = $props();

	const t = useT('BookForm');
	const tc = useT('Common');
	// svelte-ignore state_referenced_locally
	let title = $state(book?.title ?? '');
	// svelte-ignore state_referenced_locally
	let excerpt = $state(book?.excerpt ?? '');
	// svelte-ignore state_referenced_locally
	let publisher = $state(book?.publisher ?? '');
	// svelte-ignore state_referenced_locally
	let price = $state(book?.price ?? '');
	// svelte-ignore state_referenced_locally
	let language = $state(book?.language ?? 'Bangla');
	// svelte-ignore state_referenced_locally
	let coverUrl = $state(book?.coverUrl ?? '');
	// svelte-ignore state_referenced_locally
	let documentUrl = $state(book?.documentUrl ?? '');
	// svelte-ignore state_referenced_locally
	let position = $state(book ? String(book.position) : '');
	// svelte-ignore state_referenced_locally
	let publishedAt = $state(book?.publishedAt?.split('T')[0] ?? '');
	// svelte-ignore state_referenced_locally
	let published = $state(book?.published ?? true);
	// svelte-ignore state_referenced_locally
	let authorIds = $state<string[]>(book?.authors.map((a) => a.id) ?? []);
	// svelte-ignore state_referenced_locally
	let categoryIds = $state<string[]>(book?.categories.map((c) => c.id) ?? []);
	let saving = $state(false);

	onMount(() => void lookups.ensureAll());

	const authorOptions = $derived(authorsForModule(lookups.authors, 'book').map((a) => ({ id: a.id, label: a.name })));
	const categoryOptions = $derived(categoriesForModule(lookups.categories, 'book').map((c) => ({ id: c.id, label: c.title, child: !!c.parentId })));
	const count = (n: number) => t('selectedCount', { count: n });

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return toast.error(t('titleRequired'));
		saving = true;
		await saveForm({
			apiPath: '/api/books',
			id: book?.id,
			name: 'Book',
			redirect: book ? `/admin/books/${book.id}` : '/admin/books',
			failMessage: tc('somethingWentWrong'),
			payload: {
				title: title.trim(),
				excerpt: excerpt || null,
				publisher: publisher || null,
				price: price || null,
				language,
				coverUrl: coverUrl || null,
				documentUrl: documentUrl || null,
				position: position ? parseInt(position) : undefined,
				publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
				published,
				authorIds,
				categoryIds
			}
		});
		saving = false;
	}
</script>

<div class="px-4 py-6">
	<div class="mb-5">
		<div class="flex items-center justify-between mb-2">
			<button
				type="button"
				onclick={() => goBack(book ? `/admin/books/${book.id}` : '/admin/books')}
				class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				><ArrowLeft class="w-4 h-4" /> {book ? t('backToBook') : t('backToBooks')}</button
			>
			{#if book}<PublicViewButton href="/books/{book.id}" />{/if}
		</div>
		<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{book ? t('editBook') : t('addNewBook')}</p>
		{#if book}<p class="text-sm font-medium mt-0.5 text-foreground/80">{book.title}</p>{/if}
	</div>

	<form onsubmit={submit}>
		<div class="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
			<div class="space-y-4">
				<Card variant="compact" title={t('basicInformation')}>
					<Field label={t('titleLabel')} required><input bind:value={title} placeholder={t('bookTitlePlaceholder')} maxlength={100} class={inputCls} /></Field>
					<Field label={t('excerptLabel')} hint={t('excerptHint')}>
						<textarea bind:value={excerpt} placeholder={t('shortDescriptionPlaceholder')} rows="3" maxlength={500} class={textareaCls}></textarea>
						<p class="text-xs text-muted-foreground text-right">{excerpt.length}/500</p>
					</Field>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Field label={t('languageLabel')} required><Select class="w-fit" bind:value={language} options={['Bangla', 'English']} /></Field>
						<Field label={t('publisherLabel')}><input bind:value={publisher} placeholder={t('publisherPlaceholder')} maxlength={100} class={inputCls} /></Field>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Field label={t('priceLabel')}><input bind:value={price} placeholder={t('pricePlaceholder')} maxlength={50} class={inputCls} /></Field>
						<Field label={t('publishedAtLabel')}><input type="date" bind:value={publishedAt} class={inputCls} /></Field>
					</div>
				</Card>

				<Card variant="compact" title={t('authorsAndCategories')}>
					<Field label={t('authorsLabel')}>
						<MultiPicker
							options={authorOptions}
							bind:value={authorIds}
							placeholder={t('selectAuthorsPlaceholder')}
							searchPlaceholder={t('searchAuthorsPlaceholder')}
							emptyText={t('noAuthorsFound')}
							selectedText={count}
							fallbackLabel={(id) => book?.authors.find((a) => a.id === id)?.name}
						/>
					</Field>
					<Field label={t('categoriesLabel')}>
						<MultiPicker
							options={categoryOptions}
							bind:value={categoryIds}
							placeholder={t('selectCategoriesPlaceholder')}
							searchPlaceholder={t('searchCategoriesPlaceholder')}
							emptyText={t('noCategoriesFound')}
							selectedText={count}
							fallbackLabel={(id) => book?.categories.find((c) => c.id === id)?.title}
						/>
					</Field>
				</Card>

				<div class="flex gap-3">
					<Button type="submit" disabled={saving} class="flex-1 sm:flex-none sm:px-8">{saving ? t('saving') : book ? t('updateBook') : t('createBook')}</Button>
					<Button variant="outline" onclick={() => goBack(book ? `/admin/books/${book.id}` : '/admin/books')}>{tc('cancel')}</Button>
				</div>
			</div>

			<div class="space-y-4">
				<Card variant="compact" title={t('media')}>
					<Field label={t('coverImage')}><MediaField accept="image" bind:value={coverUrl} placeholder={t('noCoverImage')} compact /></Field>
					<Field label={t('documentPdf')}><MediaField accept="document" bind:value={documentUrl} placeholder={t('noDocument')} compact /></Field>
				</Card>
				<Card variant="compact" title={t('settings')}>
					<Field label={t('positionLabel')}><input type="number" min="1" bind:value={position} placeholder={t('autoPlaceholder')} class={inputCls} /></Field>
					<Checkbox bind:checked={published}>{t('publishedLabel')}</Checkbox>
				</Card>
			</div>
		</div>
	</form>
</div>
