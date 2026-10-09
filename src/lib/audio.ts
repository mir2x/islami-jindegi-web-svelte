import { bn } from './bengali-numerals.ts';

const digits = (value: string, locale: string) => (locale === 'bn' ? bn(value) : value);

/** `m:ss` for a position/duration in seconds, in the locale's digits. */
export function formatClock(seconds: number, locale: string): string {
	const s = Number.isFinite(seconds) ? seconds : 0;
	return digits(`${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`, locale);
}

export function formatFileSize(bytes: number, locale: string): string {
	return `${digits((bytes / (1024 * 1024)).toFixed(1), locale)} MB`;
}
