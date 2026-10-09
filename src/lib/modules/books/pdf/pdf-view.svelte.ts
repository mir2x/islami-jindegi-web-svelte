export type PdfLayout = 'single' | 'double';
export type PdfNav = 'continuous' | 'flip';

const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
const DEFAULT_ZOOM = 2;
/** How many pages around the visible one stay rendered in continuous mode. */
export const SCROLL_BUFFER = 3;

/** The PDF reader's view state: current page, zoom, single/double spread and flip/continuous navigation. */
export class PdfView {
	pages = $state(0);
	page = $state(1);
	zoomIdx = $state(DEFAULT_ZOOM);
	layout = $state<PdfLayout>('single');
	nav = $state<PdfNav>('flip');
	/** Pages that are currently rendered in continuous mode. */
	rendered = $state(new Set([1, 2, 3]));

	get scale() {
		return ZOOM_STEPS[this.zoomIdx];
	}
	get zoomMax() {
		return this.zoomIdx === ZOOM_STEPS.length - 1;
	}
	get step() {
		return this.layout === 'double' ? 2 : 1;
	}
	/** Left page of the current spread (spreads start on odd pages). */
	get left() {
		return this.page % 2 === 0 ? this.page - 1 : this.page;
	}

	zoomIn = () => (this.zoomIdx = Math.min(ZOOM_STEPS.length - 1, this.zoomIdx + 1));
	zoomOut = () => (this.zoomIdx = Math.max(0, this.zoomIdx - 1));
	resetZoom = () => (this.zoomIdx = DEFAULT_ZOOM);
	prev = () => (this.page = Math.max(1, this.page - this.step));
	next = () => (this.page = Math.min(this.pages, this.page + this.step));

	setLayout(layout: PdfLayout) {
		if (layout === 'double' && this.page % 2 === 0) this.page = Math.max(1, this.page - 1);
		this.layout = layout;
	}
	setNav(nav: PdfNav) {
		if (nav === 'continuous') {
			this.rendered = new Set(Array.from({ length: SCROLL_BUFFER * 2 + 1 }, (_, i) => Math.max(1, Math.min(this.pages || 999, this.page - SCROLL_BUFFER + i))));
		}
		this.nav = nav;
	}
	/** Applies the page box's text; returns the page now shown (so the box can resync on bad input). */
	commitPage(text: string): number {
		const n = parseInt(text, 10);
		if (!Number.isNaN(n) && n >= 1 && n <= this.pages) this.page = n;
		return this.page;
	}
	/** Continuous mode: a page came into view, keep it and its neighbours rendered. */
	reveal(pageNo: number) {
		const wanted: number[] = [];
		for (let j = Math.max(1, pageNo - SCROLL_BUFFER); j <= Math.min(this.pages, pageNo + SCROLL_BUFFER); j++) wanted.push(j);
		if (wanted.every((j) => this.rendered.has(j))) return;
		this.rendered = new Set([...this.rendered, ...wanted]);
	}
}
