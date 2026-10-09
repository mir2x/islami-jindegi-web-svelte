// App screens a notification can open. Paths must match GoRoutes in the Flutter app's lib/routes/index.dart;
// the app pushes data["screen"] onto its router as-is.
export const SCREENS = [
	{ key: 'home', path: '/' },
	{ key: 'quran', path: '/qurans' },
	{ key: 'books', path: '/books' },
	{ key: 'bayans', path: '/bayans' },
	{ key: 'malfuzat', path: '/malfuzat' },
	{ key: 'masail', path: '/masail' },
	{ key: 'duas', path: '/duas' },
	{ key: 'articles', path: '/articles' },
	{ key: 'news', path: '/news' },
	{ key: 'topics', path: '/topics' },
	{ key: 'madrasahs', path: '/madrasahs' },
	{ key: 'namazTimes', path: '/namaz-times' },
	{ key: 'qiblah', path: '/qiblah' },
	{ key: 'donation', path: '/donation' }
] as const;

// Detail screens: `api` is the admin-searchable list endpoint, `prefix` the app route.
export const ITEMS = [
	{ key: 'book', api: '/api/books', prefix: '/books/' },
	{ key: 'bayan', api: '/api/bayan', prefix: '/bayans/' },
	{ key: 'malfuzatItem', api: '/api/malfuzat', prefix: '/malfuzat/' },
	{ key: 'masailItem', api: '/api/masail', prefix: '/masail/' },
	{ key: 'dua', api: '/api/dua', prefix: '/duas/' },
	{ key: 'article', api: '/api/articles', prefix: '/articles/' },
	{ key: 'newsItem', api: '/api/news', prefix: '/news/' },
	{ key: 'madrasah', api: '/api/madrasahs', prefix: '/madrasahs/' }
] as const;

export const TOPIC_PREFIX = '/topics/';
export const SURA_PREFIX = '/qurans/sura/';

/** What the picker is currently choosing: a fixed screen, a specific item, a topic, a surah or a hand-typed path. */
export type Kind = string;

/** Works out which picker mode an existing path belongs to, so an edited notification reopens on it. */
export function kindOf(path: string): Kind {
	const screen = SCREENS.find((s) => s.path === path);
	if (screen) return `screen:${screen.key}`;
	const item = ITEMS.find((i) => path.startsWith(i.prefix) && path.length > i.prefix.length && !path.slice(i.prefix.length).includes('/'));
	if (item) return `item:${item.key}`;
	if (path.startsWith(TOPIC_PREFIX) && path.length > TOPIC_PREFIX.length) return 'topic';
	if (/^\/qurans\/sura\/\d+$/.test(path)) return 'sura';
	return 'custom';
}
