import { auth } from '../auth.svelte.ts';
import type { Insights, RangeId } from './types.ts';

/** Loads the Insights page's data for the chosen range; a newer choice cancels an older request. */
export class InsightsState {
	range = $state<RangeId>('7d');
	data = $state<Insights | null>(null);
	loading = $state(true);
	/** `not-configured` (no OpenObserve), `unavailable` (it did not answer) or `signed-out`. */
	error = $state<string | null>(null);
	private controller?: AbortController;

	async load(range: RangeId = this.range) {
		this.range = range;
		this.controller?.abort();
		const controller = (this.controller = new AbortController());
		this.loading = true;
		this.error = null;
		try {
			const token = auth.peekToken();
			const res = await fetch(`/api/insights?range=${range}`, { headers: token ? { authorization: `Bearer ${token}` } : {}, signal: controller.signal });
			if (res.status === 401) throw new Error('signed-out');
			const body = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(body?.error ?? 'unavailable');
			this.data = body as Insights;
		} catch (e) {
			if ((e as Error).name === 'AbortError') return;
			this.error = (e as Error).message === 'not-configured' || (e as Error).message === 'signed-out' ? (e as Error).message : 'unavailable';
		} finally {
			if (this.controller === controller) this.loading = false;
		}
	}
}
