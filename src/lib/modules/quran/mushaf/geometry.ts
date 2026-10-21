import type { AyahBox } from '#lib/types.ts';
import { BOTTOM_BAR_SAFE, PHONE_BOTTOM_BAR, TOP_BAR_SAFE } from './data.ts';

export interface PageBounds {
	w: number;
	h: number;
	x: number;
	y: number;
	showSpread: boolean;
}

/** Where the page image (or two-page spread) sits in the reader, given the space the bars leave over. */
export function computeBounds(width: number, height: number, imageWidth: number, imageHeight: number, barsVisible: boolean, spread: boolean): PageBounds | null {
	if (!width || !height) return null;
	const top = barsVisible ? TOP_BAR_SAFE : 0;
	const availH = Math.max(0, height - top - (barsVisible ? (width >= 640 ? BOTTOM_BAR_SAFE : PHONE_BOTTOM_BAR) : 0));
	if (!availH) return null;
	// Phones: the page fills the whole area below the top bar, edge to edge. The shape differs from the scan's
	// by a few percent, so it is stretched very slightly rather than leaving bars around it.
	if (width < 640) return { w: width, h: availH, x: 0, y: top, showSpread: spread };
	const ar = (imageWidth / imageHeight) * (spread ? 2 : 1);
	const fitsHeight = width / availH > ar;
	const w = fitsHeight ? availH * ar : width;
	const h = fitsHeight ? availH : width / ar;
	return { w, h, x: (width - w) / 2, y: top + (availH - h) / 2, showSpread: spread };
}

/** The boxes of one ayah on a page. */
export const boxesFor = (boxes: AyahBox[], target: { sura: number; ayah: number } | null) =>
	target ? boxes.filter((b) => b.sura_number === target.sura && b.ayah_number === target.ayah) : [];

/** Anchor for the ayah menu: just above the top-most box of the selected ayah, in the reader's coordinates. */
export function menuAnchor(bounds: PageBounds, selectedBoxes: AyahBox[], onRight: boolean, imageHeight: number, scale: number, containerHeight: number) {
	if (selectedBoxes.length === 0) return null;
	const half = bounds.showSpread ? bounds.w / 2 : bounds.w;
	const faceX = bounds.showSpread && onRight ? bounds.x + bounds.w / 2 : bounds.x;
	const fy = Math.min(...selectedBoxes.map((b) => b.min_y)) / imageHeight;
	const rendered = bounds.y + bounds.h / 2 + (fy - 0.5) * bounds.h * scale;
	return { top: Math.min(Math.max(110, rendered - 10), containerHeight - 16), left: faceX + half / 2 };
}

/** Starts loading the pages around `page` so turning to them is instant. */
export function preloadAround(page: number, spread: boolean, totalPages: number, url: (page: number) => string) {
	for (const offset of spread ? [-3, -2, -1, 1, 2, 3] : [-2, -1, 1, 2]) {
		const p = page + offset;
		if (p >= 1 && p <= totalPages) new Image().src = url(p);
	}
}
