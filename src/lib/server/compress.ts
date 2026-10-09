import { Readable } from 'node:stream';
import { constants, createBrotliCompress, createGzip } from 'node:zlib';

const COMPRESSIBLE = /^(text\/|application\/(json|xml|javascript|manifest\+json)|image\/svg\+xml)/;

/** Picks the best encoding the client accepts, or null. Brotli is preferred (smaller HTML for Bengali text). */
function pick(accept: string | null): 'br' | 'gzip' | null {
	if (!accept) return null;
	if (/\bbr\b/.test(accept)) return 'br';
	return /\bgzip\b/.test(accept) ? 'gzip' : null;
}

/**
 * Streams a response through brotli/gzip when it is compressible text and not already encoded.
 * The Node adapter only serves *pre*compressed static files; without this every SSR page would go out raw.
 */
export function compress(request: Request, response: Response): Response {
	const encoding = pick(request.headers.get('accept-encoding'));
	const type = response.headers.get('content-type') ?? '';
	if (!encoding || !response.body || request.method === 'HEAD' || response.status === 204 || response.status === 304) return response;
	if (response.headers.has('content-encoding') || !COMPRESSIBLE.test(type)) return response;

	// Low quality levels: this runs per request, so speed matters more than the last few percent.
	const transform = encoding === 'br' ? createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }) : createGzip({ level: 5 });
	const body = Readable.toWeb(Readable.fromWeb(response.body as never).pipe(transform)) as ReadableStream;

	const headers = new Headers(response.headers);
	headers.set('content-encoding', encoding);
	headers.delete('content-length');
	headers.append('vary', 'Accept-Encoding');
	return new Response(body, { status: response.status, statusText: response.statusText, headers });
}
