/** What the app's daily popup can show. Books are not offered. */
export type PopupModule = 'bayan' | 'malfuzat' | 'masail' | 'article';

export const POPUP_MODULES: readonly { id: PopupModule; label: string; path: string; cls: string }[] = [
	{ id: 'bayan', label: 'Bayan', path: '/api/bayan', cls: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' },
	{ id: 'malfuzat', label: 'Malfuzat', path: '/api/malfuzat', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' },
	{ id: 'masail', label: 'Masail', path: '/api/masail', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' },
	{ id: 'article', label: 'Article', path: '/api/articles', cls: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' }
];

export const moduleMeta = (id: PopupModule) => POPUP_MODULES.find((m) => m.id === id)!;

/** `GET /api/popup/schedule`: one admin-chosen day. */
export interface ScheduleRow {
	date: string; // yyyy-MM-dd
	module: PopupModule;
	contentId: string;
	title: string;
	/** False when the content was unpublished since it was scheduled. */
	published: boolean;
	/** False when the content was deleted since it was scheduled. */
	exists: boolean;
}

/** Whether the app can show this row; if not, that day falls back to the random pick. */
export const isShowable = (r: ScheduleRow) => r.exists && r.published;

const pad = (n: number) => String(n).padStart(2, '0');

/** `yyyy-MM-dd` of a local calendar day. */
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The local calendar day for `yyyy-MM-dd`, at midnight. */
export function parseKey(key: string): Date {
	const [y, m, d] = key.split('-').map(Number);
	return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
	const d = parseKey(key);
	d.setDate(d.getDate() + n);
	return dateKey(d);
}

/** The six weeks (Sunday first) a month's calendar shows, as 42 keys, including the neighbouring months' days. */
export function monthGrid(year: number, month: number): string[] {
	const first = new Date(year, month, 1);
	const start = new Date(year, month, 1 - first.getDay());
	return Array.from({ length: 42 }, (_, i) => dateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
}

export const monthLabel = (year: number, month: number) => new Date(year, month, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });
