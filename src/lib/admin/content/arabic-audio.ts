/** One Arabic block of a dua body: a top-level element marked `dir="rtl"` or written mostly in Arabic script, numbered from 1. */
export interface ArabicBlock {
	number: number;
	text: string;
	hash: string;
}

/** A recitation stored with the dua: the block it is for and the hash of that block's text when attached. */
export interface ArabicAudioEntry {
	n: number;
	hash: string;
	url: string;
}

/** 32-bit FNV-1a over the whitespace-normalised text, 8 hex digits. The app computes the same value; keep the two in step. */
export function blockHash(text: string): string {
	const normalised = text.replace(/\s+/g, ' ').trim();
	let h = 0x811c9dc5;
	for (let i = 0; i < normalised.length; i++) {
		h ^= normalised.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h.toString(16).padStart(8, '0');
}

const LETTER = /[\p{L}\p{M}]/gu;
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

/** At least half of the letters are Arabic script. Older duas have their Arabic as plain paragraphs, without `dir="rtl"`. The app uses the same test. */
export function isMostlyArabic(text: string): boolean {
	const letters = text.match(LETTER)?.length ?? 0;
	return letters > 0 && (text.match(ARABIC)?.length ?? 0) * 2 >= letters;
}

/** The Arabic blocks of [html], in order. The app splits the body by the same rule. */
export function arabicBlocks(html: string): ArabicBlock[] {
	if (typeof DOMParser === 'undefined') return [];
	const doc = new DOMParser().parseFromString(html, 'text/html');
	const out: ArabicBlock[] = [];
	for (const el of Array.from(doc.body.children)) {
		const text = el.textContent ?? '';
		if (el.getAttribute('dir') !== 'rtl' && !isMostlyArabic(text)) continue;
		out.push({ number: out.length + 1, text, hash: blockHash(text) });
	}
	return out;
}

export function parseEntries(raw: unknown): ArabicAudioEntry[] {
	if (typeof raw !== 'string' || !raw.trim()) return [];
	try {
		const list = JSON.parse(raw);
		if (!Array.isArray(list)) return [];
		return list.filter((e) => e && Number.isInteger(e.n) && typeof e.url === 'string').map((e) => ({ n: e.n, hash: String(e.hash ?? ''), url: e.url }));
	} catch {
		return [];
	}
}

/** The JSON stored with the dua, or an empty string when nothing is left. */
export function serializeEntries(entries: ArabicAudioEntry[]): string {
	return entries.length ? JSON.stringify([...entries].sort((a, b) => a.n - b.n)) : '';
}

export type BlockState = 'missing' | 'ready' | 'stale';

export function stateOf(block: ArabicBlock, entry: ArabicAudioEntry | undefined): BlockState {
	return !entry ? 'missing' : entry.hash === block.hash ? 'ready' : 'stale';
}

/** [entries] with block [n] set to [url] (or removed when empty), stamped with [block]'s current text. */
export function withEntry(entries: ArabicAudioEntry[], block: ArabicBlock, url: string): ArabicAudioEntry[] {
	const rest = entries.filter((e) => e.n !== block.number);
	return url ? [...rest, { n: block.number, hash: block.hash, url }] : rest;
}
