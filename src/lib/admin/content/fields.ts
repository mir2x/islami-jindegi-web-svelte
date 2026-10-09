import type { FieldDef } from './types.ts';

// Reusable field definitions. Every content module composes its form from these.

export const LANGUAGES = ['Bangla', 'English', 'Arabic', 'Urdu'];

export const title = (placeholder: string, label = 'Title', extra: { maxLength?: number } = {}): FieldDef => ({
	kind: 'text',
	key: 'title',
	label,
	placeholder,
	required: 'Title is required',
	...extra
});

export const excerpt = (o: { hint?: string; rows?: number; maxLength?: number; placeholder?: string } = {}): FieldDef => ({
	kind: 'textarea',
	key: 'excerpt',
	label: 'Excerpt',
	hint: o.hint,
	placeholder: o.placeholder ?? 'Short description...',
	rows: o.rows ?? 3,
	maxLength: o.maxLength ?? 500,
	counter: o.maxLength === undefined
});

export const language = (fallback = 'Bangla'): FieldDef => ({ kind: 'language', key: 'language', label: 'Language', mark: true, fallback });
export const position: FieldDef = { kind: 'position', key: 'position', label: 'Position' };
export const published: FieldDef = { kind: 'checkbox', key: 'published', label: 'Published', fallback: true };
export const publishedAt = (required?: string): FieldDef => ({ kind: 'date', key: 'publishedAt', label: 'Published At', iso: required ? 'always' : 'nullable', required });
export const author = (required?: string): FieldDef => ({ kind: 'author', key: 'authorId', label: 'Author', required });
export const categories: FieldDef = { kind: 'categories', key: 'categoryIds', label: 'Categories' };
export const audioFile: FieldDef = { kind: 'media', key: 'audioUrl', label: 'Audio File', accept: 'audio', placeholder: 'No audio selected' };
export const documentFile = (label = 'Document (PDF)', placeholder = 'No document'): FieldDef => ({ kind: 'media', key: 'documentUrl', label, accept: 'document', placeholder });
export const hasAudio: FieldDef = { kind: 'checkbox', key: 'hasAudio', label: 'Has Audio', fallback: false };
export const rich = (key: string, placeholder: string, height: string, o: { nullable?: boolean; required?: string; trim?: boolean } = {}): FieldDef => ({
	kind: 'rich',
	key,
	placeholder,
	height,
	...o
});
