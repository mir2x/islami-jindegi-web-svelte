import { AsyncLocalStorage } from 'node:async_hooks';
import { randomBytes } from 'node:crypto';

/** What every log line and API call made while handling one request needs to know about it. */
export interface RequestContext {
	/** The visitor's address as the edge reports it. */
	ip?: string;
	/** One id for the whole page load: nginx's `X-Request-Id`, also sent on to the API as its `TraceId`. */
	requestId: string;
	/** API calls made for this request, for the slow-page log line. */
	api: { calls: number; ms: number; failed: number };
}

const store = new AsyncLocalStorage<RequestContext>();

/** Same rule as the API (`obs::valid_request_id`): bounded and header-safe, so it is safe to log and echo. */
const VALID_ID = /^[A-Za-z0-9._-]{1,64}$/;

/** Cloudflare first, then the proxy's own header. */
function visitorIp(headers: Headers): string | undefined {
	const ip = headers.get('cf-connecting-ip') ?? headers.get('x-client-ip') ?? headers.get('x-forwarded-for')?.split(',')[0];
	return ip?.trim() || undefined;
}

export function newContext(headers: Headers): RequestContext {
	const given = headers.get('x-request-id');
	return {
		ip: visitorIp(headers),
		requestId: given && VALID_ID.test(given) ? given : randomBytes(16).toString('hex'),
		api: { calls: 0, ms: 0, failed: 0 }
	};
}

/** Runs `fn` so everything it awaits can name the request it works for. */
export const withContext = <T>(ctx: RequestContext, fn: () => Promise<T>) => store.run(ctx, fn);

export const currentContext = () => store.getStore();
export const currentVisitorIp = () => store.getStore()?.ip;
export const currentRequestId = () => store.getStore()?.requestId;
