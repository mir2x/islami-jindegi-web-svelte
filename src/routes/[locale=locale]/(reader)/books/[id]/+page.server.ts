import { error } from '@sveltejs/kit';
import { bookLd, breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo, canonicalPath } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getBook } from '#lib/server/public-api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { locale, id } = params;
	const book = await getBook(id);
	if (!book || !book.published) error(404, 'Not found');

	const path = `/books/${id}`;
	return {
		book,
		hasChapters: book.chapters.some((c) => c.body || c.subChapters.some((s) => s.body)),
		hasPdf: Boolean(book.documentUrl),
		msgs: loadMessages(locale, 'BookReader'),
		seo: buildSeo({
			locale,
			title: book.title,
			description: book.excerpt,
			path,
			image: book.coverUrl,
			publishedAt: book.publishedAt,
			type: 'article',
			jsonLd: [
				bookLd({
					name: book.title,
					description: book.excerpt,
					url: canonicalPath(locale, path),
					image: book.coverUrl,
					authors: book.authors.map((a) => a.name),
					publisher: book.publisher,
					datePublished: book.publishedAt
				}),
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: getT(locale, 'Nav')('books'), path: '/books' },
					{ name: book.title, path }
				])
			]
		})
	};
};
