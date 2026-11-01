/** One Arabic block of a dua body: a top-level `dir="rtl"` element, numbered from 1. */
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

/** The Arabic blocks of [html], in order. The app splits the body by the same rule. */
export function arabicBlocks(html: string): ArabicBlock[] {
	if (typeof DOMParser === 'undefined' || !html.includes('rtl')) return [];
	const doc = new DOMParser().parseFromString(html, 'text/html');
	const out: ArabicBlock[] = [];
	for (const el of Array.from(doc.body.children)) {
		if (el.getAttribute('dir') !== 'rtl') continue;
		const text = el.textContent ?? '';
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
