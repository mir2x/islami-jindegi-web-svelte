import { currentRequestId } from './request-context.ts';

type Level = 'info' | 'warn' | 'error';

/**
 * One JSON object per line on stdout (journal -> OpenTelemetry Collector -> OpenObserve, unit `ij-web.service`). The field names
 * follow the proxy's access line (`ts`, `level`, `logger`, `msg`); `request_id` is the id nginx gave the
 * request and the API logs as `TraceId`, so one search finds a page load on all three.
 */
export function log(level: Level, logger: string, msg: string, fields: Record<string, unknown> = {}) {
	const line = JSON.stringify({ ts: Date.now() / 1000, level, logger, msg, request_id: currentRequestId(), ...fields });
	process.stdout.write(line + '\n');
}

/** Cuts free text from outside (messages, stacks, URLs) to a size worth storing. */
export const clip = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : undefined);
