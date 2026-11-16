import { monitorEventLoopDelay } from 'node:perf_hooks';

/**
 * In-process metrics in the Prometheus text format, served by `/metrics` to the monitoring agent on the
 * host. No dependency: a handful of maps. Every label value comes from a bounded set (route ids, fixed
 * names); anything else is folded into `other` once a family holds MAX_SERIES series.
 */
const MAX_SERIES = 300;

const escape = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
const labelText = (names: readonly string[], values: readonly string[]) => names.map((n, i) => `${n}="${escape(values[i])}"`).join(',');

interface Family {
	render(out: string[]): void;
}
const families: Family[] = [];

export class Counter implements Family {
	private series = new Map<string, number>();
	constructor(
		private name: string,
		private help: string,
		private labels: readonly string[] = []
	) {
		families.push(this);
	}
	inc(values: readonly string[] = [], by = 1) {
		let key = labelText(this.labels, values);
		if (!this.series.has(key) && this.series.size >= MAX_SERIES)
			key = labelText(
				this.labels,
				this.labels.map(() => 'other')
			);
		this.series.set(key, (this.series.get(key) ?? 0) + by);
	}
	render(out: string[]) {
		out.push(`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} counter`);
		if (!this.labels.length && !this.series.size) out.push(`${this.name} 0`);
		for (const [key, n] of this.series) out.push(key ? `${this.name}{${key}} ${n}` : `${this.name} ${n}`);
	}
}

export class Histogram implements Family {
	private series = new Map<string, { buckets: number[]; sum: number; count: number }>();
	constructor(
		private name: string,
		private help: string,
		private bounds: readonly number[],
		private labels: readonly string[] = []
	) {
		families.push(this);
	}
	observe(value: number, values: readonly string[] = []) {
		if (!Number.isFinite(value) || value < 0) return;
		let key = labelText(this.labels, values);
		if (!this.series.has(key) && this.series.size >= MAX_SERIES)
			key = labelText(
				this.labels,
				this.labels.map(() => 'other')
			);
		let s = this.series.get(key);
		if (!s) this.series.set(key, (s = { buckets: this.bounds.map(() => 0), sum: 0, count: 0 }));
		const i = this.bounds.findIndex((b) => value <= b);
		if (i >= 0) s.buckets[i]++;
		s.sum += value;
		s.count++;
	}
	render(out: string[]) {
		out.push(`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} histogram`);
		for (const [key, s] of this.series) {
			const sep = key ? `${key},` : '';
			let cum = 0;
			this.bounds.forEach((b, i) => out.push(`${this.name}_bucket{${sep}le="${b}"} ${(cum += s.buckets[i])}`));
			out.push(`${this.name}_bucket{${sep}le="+Inf"} ${s.count}`);
			out.push(key ? `${this.name}_sum{${key}} ${s.sum}` : `${this.name}_sum ${s.sum}`);
			out.push(key ? `${this.name}_count{${key}} ${s.count}` : `${this.name}_count ${s.count}`);
		}
	}
}

const SECONDS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

export const httpRequests = new Counter('ij_web_http_requests_total', 'Responses by route and status class.', ['route', 'code']);
export const httpDuration = new Histogram('ij_web_http_request_duration_seconds', 'Time to produce a response, by route.', SECONDS, ['route']);
export const serverErrors = new Counter('ij_web_server_errors_total', 'Unexpected errors while rendering or in an endpoint.');
export const apiCalls = new Counter('ij_web_api_requests_total', 'Server-side calls to the API by result.', ['result']);
export const apiDuration = new Histogram('ij_web_api_request_duration_seconds', 'Server-side API call time.', SECONDS);
export const cacheLookups = new Counter('ij_web_cache_lookups_total', 'API data cache lookups by result.', ['result']);
export const clientReports = new Counter('ij_web_client_reports_total', 'Reports sent by browsers, by kind.', ['kind']);

/** What real visitors experienced, by page route. Bounds straddle the "good" and "poor" thresholds of each vital. */
export const vitals = {
	ttfb: new Histogram('ij_web_vital_ttfb_seconds', 'Time to first byte in browsers.', [0.1, 0.2, 0.4, 0.8, 1.2, 1.8, 3, 5], ['route']),
	fcp: new Histogram('ij_web_vital_fcp_seconds', 'First contentful paint in browsers.', [0.5, 1, 1.8, 2.5, 3, 4, 6, 10], ['route']),
	lcp: new Histogram('ij_web_vital_lcp_seconds', 'Largest contentful paint in browsers.', [0.5, 1, 1.5, 2.5, 3, 4, 6, 10], ['route']),
	inp: new Histogram('ij_web_vital_inp_seconds', 'Interaction to next paint in browsers.', [0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 2], ['route']),
	cls: new Histogram('ij_web_vital_cls', 'Cumulative layout shift in browsers.', [0.01, 0.05, 0.1, 0.15, 0.25, 0.5, 1], ['route'])
};

const started = Math.floor(Date.now() / 1000);
/** The timer the delay is measured with fires every this many ms; anything beyond it is the loop being late. */
const LOOP_RESOLUTION_MS = 20;
const loopDelay = monitorEventLoopDelay({ resolution: LOOP_RESOLUTION_MS });
const lag = (ns: number) => Math.max(0, ns / 1e9 - LOOP_RESOLUTION_MS / 1000);
loopDelay.enable();

/** `gauges` are values read at scrape time from elsewhere (the cache size). */
export function render(gauges: Record<string, { help: string; value: number }> = {}): string {
	const out: string[] = [];
	for (const f of families) f.render(out);
	const mem = process.memoryUsage();
	const g = (name: string, help: string, value: number) => out.push(`# HELP ${name} ${help}`, `# TYPE ${name} gauge`, `${name} ${value}`);
	for (const [name, { help, value }] of Object.entries(gauges)) g(name, help, value);
	g('ij_web_process_start_time_seconds', 'Unix time the process started.', started);
	g('ij_web_process_resident_memory_bytes', 'Resident memory.', mem.rss);
	g('ij_web_process_heap_used_bytes', 'JavaScript heap in use.', mem.heapUsed);
	// Since the previous scrape: how long the event loop was blocked at worst. A busy render shows up here.
	g('ij_web_event_loop_lag_seconds', '99th percentile event loop delay since the last scrape.', lag(loopDelay.percentile(99)));
	g('ij_web_event_loop_lag_max_seconds', 'Longest event loop delay since the last scrape.', lag(loopDelay.max));
	loopDelay.reset();
	return out.join('\n') + '\n';
}
