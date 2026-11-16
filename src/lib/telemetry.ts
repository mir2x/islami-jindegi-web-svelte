import { page } from '$app/state';

/**
 * Browser-side reporting to this site's own `/api/log` (no third party, no cookie, no visitor id): uncaught
 * errors, API calls that failed, and how fast the page felt (Core Web Vitals). Everything is best
 * effort and capped, and nothing here may ever throw into the page.
 */
type Event = Record<string, string | number | undefined>;

const ENDPOINT = '/api/log';
/** A page stuck in an error loop must not flood the endpoint. */
const MAX_REPORTS = 15;

let queue: Event[] = [];
let sent = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
const reported = new Set<string>();

function where(): Event {
	try {
		return { url: location.pathname + location.search, route: page.route.id ?? undefined };
	} catch {
		return { url: location.pathname };
	}
}

function flush() {
	clearTimeout(timer);
	timer = undefined;
	if (!queue.length) return;
	const body = JSON.stringify({ events: queue });
	queue = [];
	try {
		// JSON, not a form type: survives the page closing and needs no origin check on the server.
		if (!navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) {
			void fetch(ENDPOINT, { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
		}
	} catch {
		/* reporting is best effort */
	}
}

function send(event: Event) {
	if (sent >= MAX_REPORTS) return;
	sent++;
	queue.push({ ...where(), ...event });
	timer ??= setTimeout(flush, 2000);
}

/** An error nobody handled. The same error repeated on one page is reported once. */
export function reportError(error: unknown, src: 'navigation' | 'window' | 'promise') {
	const e = error instanceof Error ? error : undefined;
	const msg = e ? `${e.name}: ${e.message}` : String(error);
	// Other people's scripts (extensions, injected ads) surface as this and tell us nothing.
	if (msg === 'Script error.' || reported.has(msg)) return;
	reported.add(msg);
	send({ t: 'error', src, msg: msg.slice(0, 500), stack: e?.stack?.slice(0, 3000) });
}

/**
 * An API call from the browser that failed: the server answered 5xx, or never answered. `res` carries
 * the API's request id (`X-Request-Id`), which is its `TraceId` in the API logs.
 */
export function reportApiFailure(method: string, path: string, res: Response | null) {
	if (res && res.status < 500) return;
	// The visitor went offline or left the page: not something the server can fix.
	if (!res && (navigator.onLine === false || document.visibilityState === 'hidden')) return;
	send({ t: 'api', method, path: path.split('?')[0].slice(0, 300), status: res?.status ?? 0, rid: res?.headers.get('x-request-id') ?? undefined });
}

/** Core Web Vitals for the page the visitor landed on, sent once when they leave or hide it. */
function watchVitals() {
	const v: { ttfb?: number; fcp?: number; lcp?: number; inp?: number; cls: number } = { cls: 0 };
	// The numbers belong to the page the visitor landed on. Its route id is not known yet when the app
	// starts, so it is read shortly after, as long as they are still on that page.
	const landed: Event = { url: location.pathname + location.search };
	const pin = () => {
		if (landed.route === undefined && location.pathname + location.search === landed.url) landed.route = where().route;
	};
	for (const ms of [0, 300, 1500]) setTimeout(pin, ms);
	const observe = (type: string, on: (entry: PerformanceEntry) => void, extra: object = {}) => {
		try {
			new PerformanceObserver((list) => list.getEntries().forEach(on)).observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
		} catch {
			/* this browser does not report that entry type */
		}
	};

	const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
	if (nav && nav.responseStart > 0) v.ttfb = nav.responseStart / 1000;
	observe('paint', (e) => {
		if (e.name === 'first-contentful-paint') v.fcp = e.startTime / 1000;
	});
	observe('largest-contentful-paint', (e) => (v.lcp = e.startTime / 1000));
	// Layout shift score, in session windows (shifts under 1 s apart, 5 s at most); the worst window counts.
	let win = { score: 0, first: 0, last: 0 };
	observe('layout-shift', (entry) => {
		const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
		if (e.hadRecentInput) return;
		if (win.score && e.startTime - win.last < 1000 && e.startTime - win.first < 5000) win = { ...win, score: win.score + e.value, last: e.startTime };
		else win = { score: e.value, first: e.startTime, last: e.startTime };
		v.cls = Math.max(v.cls, win.score);
	});
	// Slowest interaction (tap, click, key press) from input to the next frame. With few interactions per
	// page the worst one is the value; this does not drop outliers the way the official definition does.
	observe(
		'event',
		(entry) => {
			const e = entry as PerformanceEntry & { interactionId?: number };
			if (e.interactionId) v.inp = Math.max(v.inp ?? 0, e.duration / 1000);
		},
		{ durationThreshold: 40 }
	);

	let done = false;
	const finish = () => {
		if (done || document.visibilityState !== 'hidden') return;
		done = true;
		pin();
		// A tab opened in the background never painted for anyone.
		if (v.lcp === undefined && v.fcp === undefined) return flush();
		const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType;
		const round = (n?: number) => (n === undefined ? undefined : Math.round(n * 1000) / 1000);
		queue.push({ ...landed, t: 'vitals', ttfb: round(v.ttfb), fcp: round(v.fcp), lcp: round(v.lcp), inp: round(v.inp), cls: round(v.cls), conn });
		flush();
	};
	document.addEventListener('visibilitychange', finish);
	addEventListener('pagehide', finish);
}

/** Called once when the app starts in the browser (`hooks.client.ts`). */
export function startTelemetry() {
	addEventListener('error', (e) => reportError(e.error ?? e.message, 'window'));
	addEventListener('unhandledrejection', (e) => reportError(e.reason, 'promise'));
	// Errors queued just before the page goes away still get out.
	addEventListener('pagehide', flush);
	watchVitals();
}
