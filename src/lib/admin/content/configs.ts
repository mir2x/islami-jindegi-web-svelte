import { audioFile, author, categories, documentFile, excerpt, hasAudio, language, position, published, publishedAt, rich, title } from './fields.ts';
import type { Column, ContentConfig, Section, TabDef } from './types.ts';

const POSITION: Column = { kind: 'position', label: 'Position', sort: 'position', width: 'w-32' };
const TITLE: Column = { kind: 'title', label: 'Title', sort: 'title', width: '' };
const AUTHOR: Column = { kind: 'author', label: 'Author', sort: 'author', width: 'w-56' };
const LANGUAGE: Column = { kind: 'language', label: 'Language', sort: 'language', width: 'w-32' };
const STATUS: Column = { kind: 'status', label: 'Status', sort: 'published', width: 'w-36' };
const OFFLINE: Column = { kind: 'offline', label: 'Offline', width: 'w-24' };

const settings = (...rows: Section['rows']): Section => ({ title: 'Settings', rows });
const media = (...rows: Section['rows']): TabDef => ({ id: 'media', label: 'Media', sections: [{ title: 'Media', rows }] });
const authorAndCategories = (requiredAuthor?: string): Section => ({ title: 'Author & Categories', rows: [author(requiredAuthor), categories] });

const base = { hasOffline: true, defaultSort: 'position_desc' } as const;

export const articles: ContentConfig = {
	...base,
	slug: 'articles',
	api: 'articles',
	detail: (id) => `/api/articles/${id}/admin`,
	singular: 'article',
	plural: 'Articles',
	backLabel: 'Articles',
	publicPath: '/articles',
	toastName: 'Article',
	module: 'article',
	hasAuthor: true,
	icon: 'newspaper',
	emptyHint: 'Add your first article',
	columns: [POSITION, TITLE, AUTHOR, LANGUAGE, STATUS, OFFLINE],
	tabs: [
		{
			id: 'general',
			label: 'General',
			sections: [
				{ title: 'Basic Information', rows: [title('Article title'), excerpt({ hint: 'for SEO & social media' }), language()] },
				authorAndCategories(),
				settings([position, publishedAt()], published)
			]
		},
		{
			id: 'content',
			label: 'Content',
			sections: [{ title: 'Article Body', requiredMark: true, rows: [rich('body', 'Write article content...', 'h-[500px]', { required: 'Body is required' })] }]
		},
		{ id: 'media', label: 'Media', sections: [{ title: 'Document', rows: [documentFile('', 'No document')] }] }
	]
};

export const bayan: ContentConfig = {
	...base,
	slug: 'bayan',
	api: 'bayan',
	detail: (id) => `/api/bayan/${id}/admin`,
	singular: 'bayan',
	plural: 'Bayan',
	backLabel: 'Bayan',
	publicPath: '/bayan',
	toastName: 'Bayan',
	module: 'bayan',
	hasAuthor: true,
	icon: 'mic',
	copyId: true,
	emptyHint: 'Add your first entry',
	columns: [
		POSITION,
		TITLE,
		AUTHOR,
		LANGUAGE,
		{ kind: 'location', label: 'Location', sort: 'location', width: 'w-40' },
		{ kind: 'date', label: 'Date', sort: 'date', width: 'w-36' },
		STATUS,
		OFFLINE
	],
	tabs: [
		{
			id: 'general',
			label: 'General',
			sections: [
				{
					title: 'Basic Information',
					rows: [
						title('Bayan title'),
						excerpt({ placeholder: 'Short description...' }),
						[language(), { kind: 'text', key: 'location', label: 'Location', placeholder: 'e.g. Dhaka, Bangladesh', nullable: true }]
					]
				},
				authorAndCategories('Author is required'),
				settings([position, publishedAt('Published date is required')], published)
			]
		},
		{ id: 'media', label: 'Media', sections: [{ title: 'Audio', rows: [audioFile] }] }
	]
};

export const masail: ContentConfig = {
	...base,
	slug: 'masail',
	api: 'masail',
	detail: (id) => `/api/masail/${id}/admin`,
	singular: 'masail',
	plural: 'Masail',
	backLabel: 'Masail',
	publicPath: '/masail',
	toastName: 'Masail',
	module: 'masail',
	hasAuthor: true,
	icon: 'help',
	emptyHint: 'Add your first entry',
	columns: [POSITION, { ...TITLE }, AUTHOR, LANGUAGE, STATUS, OFFLINE],
	tabs: [
		{
			id: 'general',
			label: 'General',
			sections: [
				{ title: 'Basic Information', rows: [title('Brief subject of the masail', 'Title / Subject'), language()] },
				authorAndCategories(),
				settings([position, publishedAt()], published)
			]
		},
		{
			id: 'content',
			label: 'Content',
			sections: [
				{ title: 'Question', requiredMark: true, rows: [rich('question', 'Write the question...', 'h-[200px]', { required: 'Question is required' })] },
				{ title: 'Answer', rows: [rich('answer', 'Write the answer...', 'h-[400px]', { nullable: true })] }
			]
		},
		media(hasAudio, { ...audioFile, when: (v) => !!v.hasAudio }, documentFile())
	]
};

export const malfuzat: ContentConfig = {
	...base,
	slug: 'malfuzat',
	api: 'malfuzat',
	detail: (id) => `/api/malfuzat/${id}/admin`,
	singular: 'malfuzat',
	plural: 'Malfuzat',
	backLabel: 'Malfuzat',
	publicPath: '/malfuzat',
	toastName: 'Malfuzat',
	module: 'malfuzat',
	hasAuthor: true,
	icon: 'scroll',
	emptyHint: 'Add your first entry',
	columns: [POSITION, TITLE, AUTHOR, LANGUAGE, { kind: 'audio', label: 'Audio', sort: 'audio', width: 'w-28' }, STATUS, OFFLINE],
	tabs: [
		{
			id: 'general',
			label: 'General',
			sections: [
				{ title: 'Basic Information', rows: [title('Title'), excerpt({ hint: 'short description' }), language()] },
				authorAndCategories('Author is required'),
				settings([position, publishedAt()], published)
			]
		},
		{ id: 'content', label: 'Content', sections: [{ title: 'Body', rows: [rich('body', 'Write content...', 'h-[640px]', { nullable: true })] }] },
		media(hasAudio, { ...audioFile, when: (v) => !!v.hasAudio }, documentFile())
	]
};

export const dua: ContentConfig = {
	...base,
	slug: 'dua',
	api: 'dua',
	detail: (id) => `/api/dua/${id}/admin`,
	singular: 'dua',
	plural: 'Dua',
	backLabel: 'Dua',
	publicPath: '/dua',
	toastName: 'Dua',
	module: 'dua',
	hasAuthor: false,
	icon: 'sparkles',
	emptyHint: 'Add your first entry',
	defaultSort: 'position_desc',
	columns: [POSITION, TITLE, { kind: 'categories', label: 'Categories', sort: 'categories', width: 'w-64' }, LANGUAGE, STATUS, OFFLINE],
	tabs: [
		{
			id: 'general',
			label: 'General',
			sections: [
				{ title: 'Basic Information', rows: [title('Dua title'), excerpt(), language('Arabic')] },
				{ title: 'Categories', rows: [categories] },
				settings(position, published)
			]
		},
		{
			id: 'content',
			label: 'Content',
			sections: [{ title: 'Dua Text', requiredMark: true, rows: [rich('body', 'Write dua text...', 'h-[500px]', { required: 'Body is required' })] }]
		},
		media(audioFile, documentFile())
	]
};

export const news: ContentConfig = {
	slug: 'news',
	api: 'news',
	detail: (id) => `/api/news/${id}`,
	singular: 'news',
	plural: 'News',
	backLabel: 'news',
	publicPath: '/news',
	toastName: 'News',
	hasAuthor: false,
	hasOffline: false,
	defaultSort: 'position_desc',
	icon: 'rss',
	emptyHint: 'Add your first news article',
	columns: [POSITION, TITLE, { ...LANGUAGE }, { ...STATUS, width: 'w-36' }, { kind: 'longDate', label: 'Published At', sort: 'date', width: 'w-40' }],
	tabs: [
		{
			id: 'general',
			label: 'General',
			sections: [
				{
					title: 'Basic Information',
					rows: [
						title('News title', 'Title', { maxLength: 200 }),
						excerpt({ hint: 'for SEO & social media', rows: 2, maxLength: 300, placeholder: 'Short summary...' }),
						[language(), publishedAt()]
					]
				},
				settings(position, published)
			]
		},
		{
			id: 'content',
			label: 'Content',
			sections: [{ title: 'Body', requiredMark: true, rows: [rich('body', 'Full news content...', 'h-[500px]', { required: 'Body is required', trim: true })] }]
		}
	]
};

export const CONTENT = { articles, bayan, masail, malfuzat, dua, news } as const;
export type ContentKey = keyof typeof CONTENT;
