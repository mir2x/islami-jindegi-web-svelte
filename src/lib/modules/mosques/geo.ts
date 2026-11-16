import type { Mosque } from '#lib/types/mosques.ts';

export interface Point {
	lat: number;
	lng: number;
}

const rad = (d: number) => (d * Math.PI) / 180;

/** Straight-line metres between two points. */
export function distanceM(a: Point, b: Point): number {
	const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
	return 12742000 * Math.asin(Math.sqrt(h));
}

/** About 4.8 km/h, the same pace the app uses. */
export const walkMinutes = (meters: number) => Math.max(1, Math.ceil(meters / 80));

/** The name in the reader's language when OSM has one, else whatever is there; empty when the mosque is unnamed. */
export function displayName(m: Mosque, locale: string): string {
	const [preferred, other] = locale === 'bn' ? [m.nameBn, m.nameEn] : [m.nameEn, m.nameBn];
	return preferred || m.name || other;
}

export const directionsUrl = (m: Point) => `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}&travelmode=walking`;
export const osmUrl = (m: Mosque) => `https://www.openstreetmap.org/${m.id.split('-')[0]}/${m.id.split('-')[1]}`;

/** `http` links only: OSM tags are typed by anyone, so a `javascript:` value must never become a link. */
export function safeUrl(raw: string): string | null {
	const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
	try {
		const u = new URL(url);
		return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
	} catch {
		return null;
	}
}
