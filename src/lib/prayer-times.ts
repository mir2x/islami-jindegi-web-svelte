import { Coordinates, CalculationMethod, PrayerTimes, Madhab, Prayer } from 'adhan';
import { getSettings } from './settings.ts';

export interface PrayerSlot {
	key: string;
	nameBn: string;
	nameEn: string;
	start: Date;
	end: Date;
	isForbidden: boolean;
	/** matches NamazTime.Slug — or, on an older API, Title/TitleBn — for linking to detail page */
	titleKey: string;
	/** alternate title spellings to try */
	aliases?: string[];
}

type MethodKey = keyof typeof CalculationMethod;

function buildParams() {
	const s = getSettings();
	const factory = CalculationMethod[s.method as MethodKey] ?? CalculationMethod.Karachi;
	const p = factory();
	p.madhab = s.madhab === 'shafi' ? Madhab.Shafi : Madhab.Hanafi;
	p.adjustments.fajr = s.fajr;
	p.adjustments.sunrise = s.sunrise;
	p.adjustments.dhuhr = s.dhuhr;
	p.adjustments.asr = s.asr;
	p.adjustments.maghrib = s.maghrib;
	p.adjustments.isha = s.isha;
	return p;
}

function addMins(d: Date, m: number) {
	return new Date(d.getTime() + m * 60000);
}
function subMins(d: Date, m: number) {
	return new Date(d.getTime() - m * 60000);
}

export function calcPrayerSlots(lat: number, lng: number, date = new Date()): PrayerSlot[] {
	const coords = new Coordinates(lat, lng);
	const params = buildParams();
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const pt = new PrayerTimes(coords, d, params);
	const ptNext = new PrayerTimes(coords, addMins(d, 24 * 60), params);

	return [
		{
			key: 'tahajjud',
			nameBn: 'তাহাজ্জুদ, সাহরী শেষ',
			nameEn: 'Tahajjud / Sehri',
			start: subMins(pt.fajr, 10),
			end: subMins(pt.fajr, 10),
			isForbidden: false,
			titleKey: 'Tahajjud',
			// The live row for this slot is titled in Bengali only.
			aliases: ['তাহাজ্জুদ']
		},
		{
			key: 'fajr',
			nameBn: 'ফজর',
			nameEn: 'Fajr',
			start: pt.fajr,
			end: subMins(pt.sunrise, 1),
			isForbidden: false,
			titleKey: 'Fajr'
		},
		{
			key: 'sunrise',
			nameBn: 'সূর্যোদয়',
			nameEn: 'Sunrise',
			start: pt.sunrise,
			end: addMins(pt.sunrise, 14),
			isForbidden: true,
			titleKey: 'Sunrise'
		},
		{
			key: 'ishraq',
			nameBn: 'ইশরাক, চাশত',
			nameEn: 'Ishraq / Chasht',
			start: addMins(pt.sunrise, 15),
			end: subMins(pt.dhuhr, 1),
			isForbidden: false,
			titleKey: 'Ishraq'
		},
		{
			key: 'midday',
			nameBn: 'দ্বিপ্রহর',
			nameEn: 'Midday',
			start: pt.dhuhr,
			end: addMins(pt.dhuhr, 4),
			isForbidden: true,
			titleKey: 'Midday'
		},
		{
			key: 'dhuhr',
			nameBn: 'যুহর, যাওয়াল',
			nameEn: 'Dhuhr / Zuhr',
			start: addMins(pt.dhuhr, 5),
			end: subMins(pt.asr, 1),
			isForbidden: false,
			titleKey: 'Dhuhr',
			aliases: ['Zuhr', 'Dhuhr/Zuhr', 'Zuhr/Dhuhr']
		},
		{
			key: 'asr',
			nameBn: 'আসর',
			nameEn: 'Asr',
			start: pt.asr,
			end: subMins(pt.maghrib, 4),
			isForbidden: false,
			titleKey: 'Asr'
		},
		{
			key: 'sunset',
			nameBn: 'সূর্যাস্ত',
			nameEn: 'Sunset',
			start: subMins(pt.maghrib, 3),
			end: subMins(pt.maghrib, 1),
			isForbidden: true,
			titleKey: 'Sunset'
		},
		{
			key: 'maghrib',
			nameBn: 'মাগরিব, ইফতার',
			nameEn: 'Maghrib / Iftar',
			start: pt.maghrib,
			end: subMins(pt.isha, 1),
			isForbidden: false,
			titleKey: 'Maghrib'
		},
		{
			key: 'isha',
			nameBn: 'ইশা',
			nameEn: 'Isha',
			start: pt.isha,
			end: subMins(ptNext.fajr, 10),
			isForbidden: false,
			titleKey: 'Isha'
		}
	];
}

export function findActiveSlot(slots: PrayerSlot[], now: Date): string | null {
	for (const s of slots) {
		if (now >= s.start && now < s.end) return s.key;
	}
	// Slots are built per calendar day, so before Sehri end the running slot is
	// *yesterday's* Isha (it spans midnight) and isn't in the list.
	const first = slots[0];
	if (first && now < first.start) return 'isha';
	// Between Sehri end (the zero-width tahajjud marker) and Fajr.
	const fajr = slots.find((s) => s.key === 'fajr');
	if (fajr && now < fajr.start) return 'tahajjud';
	return null;
}

export function findNextSlot(slots: PrayerSlot[], now: Date): PrayerSlot | null {
	for (const s of slots) {
		if (s.start > now) return s;
	}
	return slots[1] ?? null; // fajr
}
