import type { MediaType } from '#lib/types.ts';

// Mirrors MediaService.AllowedMimeTypes / MaxSizeBytes in the API, so bad files fail instantly instead of after a full upload.
const ALLOWED_MIME_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'audio/mpeg',
	'audio/mp3',
	'audio/mp4',
	'audio/ogg',
	'audio/wav',
	'audio/webm',
	'audio/x-m4a',
	'application/pdf'
]);
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;
const TYPE_LABELS: Record<MediaType, string> = { image: 'image', audio: 'audio', document: 'PDF' };

export type FilterType = 'all' | MediaType;

export const FILTER_TABS: { label: string; value: FilterType }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Images', value: 'image' },
	{ label: 'Audio', value: 'audio' },
	{ label: 'Documents', value: 'document' }
];

export const ACCEPT_ATTR: Record<FilterType, string> = { all: '*', image: 'image/*', audio: 'audio/*', document: '.pdf,application/pdf' };

const mediaTypeOf = (mime: string): MediaType => (mime.startsWith('image/') ? 'image' : mime.startsWith('audio/') ? 'audio' : 'document');

/** Why the API would reject this file, or null if it's fine. */
export function validateUpload(file: File, accept?: MediaType): string | null {
	if (!ALLOWED_MIME_TYPES.has(file.type)) return `Unsupported file type${file.type ? ` (${file.type})` : ''}`;
	if (accept && mediaTypeOf(file.type) !== accept) return `Only ${TYPE_LABELS[accept]} files can be uploaded here`;
	if (file.size > MAX_UPLOAD_BYTES) return 'File must be under 200 MB';
	return null;
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
