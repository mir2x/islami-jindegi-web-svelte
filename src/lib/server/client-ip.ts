import { AsyncLocalStorage } from 'node:async_hooks';

const store = new AsyncLocalStorage<string | undefined>();

/** The visitor's address as the edge reports it: Cloudflare first, then the proxy's own header. */
function visitorIp(headers: Headers): string | undefined {
	const ip = headers.get('cf-connecting-ip') ?? headers.get('x-client-ip') ?? headers.get('x-forwarded-for')?.split(',')[0];
	return ip?.trim() || undefined;
}

/** Runs `fn` so every API call made while handling this request can name the visitor it is for. */
export const withVisitorIp = <T>(headers: Headers, fn: () => Promise<T>) => store.run(visitorIp(headers), fn);

export const currentVisitorIp = () => store.getStore();
