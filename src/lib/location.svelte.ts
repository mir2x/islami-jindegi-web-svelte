import { bdDistrict, type BdDistrict } from './bd-districts.ts';

/**
 * Where the visitor is, for prayer times, the Qibla and nearby mosques. One shared choice for every page:
 * a Bangladesh district picked by hand (remembered), or the browser's position (asked for, never assumed),
 * with Dhaka until either is known. The position never leaves the browser except to name the place.
 */
export interface Place {
	lat: number;
	lng: number;
	/** Known for Dhaka and districts; a GPS fix is resolved to a country by its coordinates when needed. */
	country?: string;
	districtId?: string;
	/** What the reverse lookup called a GPS fix. */
	gpsName?: string;
	source: 'default' | 'district' | 'gps';
}

const KEY = 'ij_location';
const DHAKA: BdDistrict = bdDistrict('Dhaka')!;
const fromDistrict = (d: BdDistrict, source: Place['source'] = 'district'): Place => ({ lat: d.lat, lng: d.lng, country: 'BD', districtId: d.en, source });

export const loc = $state<{ place: Place; locating: boolean; denied: boolean }>({ place: fromDistrict(DHAKA, 'default'), locating: false, denied: false });

let started = false;

const read = (): { district?: string } | null => {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? 'null');
	} catch {
		return null;
	}
};
const save = (v: object) => {
	try {
		localStorage.setItem(KEY, JSON.stringify(v));
	} catch {
		/* the choice just is not remembered */
	}
};

function requestPosition(locale: string) {
	if (!('geolocation' in navigator)) return;
	loc.locating = true;
	loc.denied = false;
	navigator.geolocation.getCurrentPosition(
		(pos) => {
			const { latitude: lat, longitude: lng } = pos.coords;
			loc.place = { lat, lng, source: 'gps' };
			loc.locating = false;
			fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${locale}`)
				.then((r) => r.json())
				.then((d) => {
					const city = d.address?.city || d.address?.town || d.address?.county || d.address?.state;
					const name = [city, d.address?.country].filter(Boolean).join(', ');
					// Only if the visitor has not moved on to another choice in the meantime.
					if (name && loc.place.source === 'gps' && loc.place.lat === lat) loc.place = { ...loc.place, gpsName: name };
				})
				.catch(() => {});
		},
		() => {
			loc.locating = false;
			loc.denied = true;
		},
		{ timeout: 6000 }
	);
}

/** Once per page load, from the browser: a remembered district wins; otherwise the browser is asked, as the prayer page always did. */
export function startLocation(locale: string) {
	if (started) return;
	started = true;
	const d = bdDistrict(read()?.district);
	if (d) loc.place = fromDistrict(d);
	else requestPosition(locale);
}

export function chooseDistrict(id: string) {
	const d = bdDistrict(id);
	if (!d) return;
	loc.place = fromDistrict(d);
	loc.denied = false;
	save({ district: id });
}

export function useMyPosition(locale: string) {
	save({});
	requestPosition(locale);
}

export function placeName(p: Place, locale: string, fallback: string, yourPosition = fallback): string {
	if (p.districtId && p.source !== 'default')
		return `${locale === 'bn' ? (bdDistrict(p.districtId)?.bn ?? p.districtId) : p.districtId}, ${locale === 'bn' ? 'বাংলাদেশ' : 'Bangladesh'}`;
	return p.source === 'gps' ? (p.gpsName ?? yourPosition) : fallback;
}
