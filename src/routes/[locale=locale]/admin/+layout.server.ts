import { buildSeo } from '#lib/seo.ts';
import { loadMessages } from '#lib/server/i18n.ts';
import type { LayoutServerLoad } from './$types';

/** Every admin namespace, once: the dashboard navigates client-side and never refetches them. */
const ADMIN_NAMESPACES = ['AdminNav', 'BooksAdmin', 'BookForm', 'ChapterForm', 'SubChapterForm', 'OfflineSync', 'Notifications'];

export const load: LayoutServerLoad = ({ params }) => ({
	msgs: loadMessages(params.locale, ...ADMIN_NAMESPACES),
	seo: buildSeo({ locale: params.locale, title: 'Admin Dashboard', path: '/admin', translated: false, absoluteTitle: true, noindex: true })
});
