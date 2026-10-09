/** Byte-bounded LRU for resized images, so repeat requests never touch sharp or the upstream host. */
const MAX_BYTES = 64 * 1024 * 1024;

const entries = new Map<string, Buffer>();
let bytes = 0;

export function getImage(key: string): Buffer | undefined {
	const hit = entries.get(key);
	if (hit) {
		entries.delete(key);
		entries.set(key, hit);
	}
	return hit;
}

export function putImage(key: string, data: Buffer) {
	if (data.length > MAX_BYTES / 4) return;
	const old = entries.get(key);
	if (old) bytes -= old.length;
	entries.delete(key);
	entries.set(key, data);
	bytes += data.length;
	for (const [k, v] of entries) {
		if (bytes <= MAX_BYTES) break;
		entries.delete(k);
		bytes -= v.length;
	}
}
