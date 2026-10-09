import sharp from 'sharp';
import { IMAGE_WIDTHS } from '#lib/image.ts';
import { getImage, putImage } from '#lib/server/image-cache.ts';
import type { RequestHandler } from './$types';

const ALLOWED_HOSTS = ['static.islamijindegi.com'];
const MAX_UPSTREAM_BYTES = 25 * 1024 * 1024;
const HEADERS = {
	'content-type': 'image/webp',
	// The URL embeds source and width, so a changed image gets a new URL: cache forever.
	'cache-control': 'public, max-age=31536000, immutable'
};

sharp.concurrency(2);
const inflight = new Map<string, Promise<Buffer>>();

const allowed = (url: URL) => url.protocol === 'https:' && ALLOWED_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
const snap = (w: number) => IMAGE_WIDTHS.find((x) => x >= w) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];

async function render(source: string, width: number): Promise<Buffer> {
	const res = await fetch(source, { signal: AbortSignal.timeout(15000) });
	if (!res.ok) throw new Error(`upstream ${res.status}`);
	const input = Buffer.from(await res.arrayBuffer());
	if (input.length > MAX_UPSTREAM_BYTES) throw new Error('too large');
	return sharp(input, { failOn: 'none' }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
}

/** Resizing proxy for CMS images; the SvelteKit stand-in for Next's image optimizer. */
export const GET: RequestHandler = async ({ url }) => {
	let source: URL;
	try {
		source = new URL(url.searchParams.get('url') ?? '');
	} catch {
		return new Response('Bad request', { status: 400 });
	}
	const requested = Number(url.searchParams.get('w'));
	if (!allowed(source) || !Number.isFinite(requested) || requested <= 0) return new Response('Forbidden', { status: 403 });

	const width = snap(requested);
	const key = `${width}|${source.href}`;
	const hit = getImage(key);
	if (hit) return new Response(new Uint8Array(hit), { headers: HEADERS });

	let job = inflight.get(key);
	if (!job) {
		job = render(source.href, width).finally(() => inflight.delete(key));
		inflight.set(key, job);
	}
	try {
		const data = await job;
		putImage(key, data);
		return new Response(new Uint8Array(data), { headers: HEADERS });
	} catch {
		return new Response('Image unavailable', { status: 502 });
	}
};
