<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Tag from '@lucide/svelte/icons/tag';
	import User from '@lucide/svelte/icons/user';
	import Img from '#lib/components/ui/Img.svelte';
	import TopicLinks from '#lib/components/shared/TopicLinks.svelte';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import BookReader from '#lib/modules/books/BookReader.svelte';

	let { data } = $props();
	const book = $derived(data.book);
	const t = useT('BookReader');
	const locale = $derived(currentLocale());
</script>

{#if data.hasChapters || data.hasPdf}
	<BookReader {book} hasChapters={data.hasChapters} hasPdf={data.hasPdf} />
{:else}
	<!-- A book with neither chapters nor a PDF: just its description. -->
	<div class="h-full overflow-y-auto">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
			<a href={localePath('/books', locale)} class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
				><ArrowLeft class="w-4 h-4" />{t('allBooks')}</a
			>
			<div class="flex flex-col sm:flex-row gap-8">
				<div class="shrink-0 w-40 sm:w-48">
					<div class="aspect-[3/4] relative rounded-xl overflow-hidden bg-muted shadow-md">
						<Img src={book.coverUrl || '/images/default-book.png'} alt={book.title} eager sizes="192px" class="object-cover" />
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<h1 class="text-2xl font-bold text-foreground leading-snug mb-2">{book.title}</h1>
					{#if book.authors.length > 0}<div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
							<User class="w-4 h-4 shrink-0" />{book.authors.map((a) => a.name).join(', ')}
						</div>{/if}
					{#if book.categories.length > 0}<div class="flex items-center gap-2 flex-wrap mb-4 text-sm text-muted-foreground">
							<Tag class="w-4 h-4 shrink-0" /><TopicLinks categories={book.categories} />
						</div>{/if}
					{#if book.publisher}<p class="text-sm text-muted-foreground mb-1">{t('publisher', { name: book.publisher })}</p>{/if}
					{#if book.price}<p class="text-sm text-muted-foreground mb-4">{t('price', { price: book.price })}</p>{/if}
					{#if book.excerpt}<div class="prose-content mt-4">{@html book.excerpt}</div>{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
