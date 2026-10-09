import umalqura from '@umalqura/core';
import { getSettings } from './settings.ts';

// ── Hijri date ────────────────────────────────────────────────────────────────
const HIJRI_MONTHS_BN = [
	// Canonical Bangla spellings, shared 1:1 with the dotnet API's
	// HijriService.MonthNames and the app's l10n — keep all three in sync.
	'মুহাররম',
	'সফর',
	'রবিউল আউয়াল',
	'রবিউস সানি',
	'জুমাদাল উলা',
	'জুমাদাল উখরা',
	'রজব',
	'শাবান',
	'রমাযান',
	'শাউয়াল',
	'যিলক্বদ',
	'যিলহাজ্জ'
];
export const HIJRI_MONTHS_EN = [
	'Muharram',
	'Safar',
	'Rabi al-Awwal',
	'Rabi al-Thani',
	'Jumada al-Awwal',
	'Jumada al-Thani',
	'Rajab',
	'Shaban',
	'Ramadan',
	'Shawwal',
	'Dhul-Qadah',
	'Dhul-Hijjah'
];

export function toHijri(date: Date): { day: number; month: number; year: number; monthBn: string; monthEn: string } {
	// Umm al-Qura shifted one day back — Bangladesh's default relationship to the
	// Saudi calendar (mirrors the dotnet API's default_offset=+1 on month starts) —
	// plus the user's manual adjustment. This is the instant-render/offline value;
	// the sighting-aware backend date (src/lib/hijri.ts) replaces it when available,
	// and matches it exactly whenever no per-month override exists.
	const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate() + getSettings().hijriAdjustment - 1);
	const u = umalqura(shifted);
	return {
		day: u.hd,
		month: u.hm,
		year: u.hy,
		monthBn: HIJRI_MONTHS_BN[u.hm - 1] ?? '',
		monthEn: HIJRI_MONTHS_EN[u.hm - 1] ?? ''
	};
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function toBnNum(n: number) {
	return String(n)
		.split('')
		.map((c) => BN_DIGITS[+c] ?? c)
		.join('');
}

/** Renders a number in Bengali numerals for `bn`, or plain digits for any other locale. */
export function formatNum(n: number, locale: string) {
	return locale === 'bn' ? toBnNum(n) : String(n);
}

export function formatTimeBn(d: Date) {
	const h = d.getHours() % 12 || 12;
	const m = d.getMinutes().toString().padStart(2, '0');
	const ampm = d.getHours() < 12 ? 'AM' : 'PM';
	return `${toBnNum(h)}:${m
		.split('')
		.map((c) => BN_DIGITS[+c] ?? c)
		.join('')} ${ampm}`;
}

/** Locale-aware time formatting — Bengali numerals for `bn`, plain digits otherwise. */
export function formatTime(d: Date, locale: string) {
	if (locale === 'bn') return formatTimeBn(d);
	const h = d.getHours() % 12 || 12;
	const m = d.getMinutes().toString().padStart(2, '0');
	const ampm = d.getHours() < 12 ? 'AM' : 'PM';
	return `${h}:${m} ${ampm}`;
}

// ── Bangla (Bengali solar) calendar ──────────────────────────────────────────
const BANGLA_MONTHS_BN = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
const BANGLA_MONTHS_EN = ['Boishakh', 'Joishtho', 'Ashar', 'Shrabon', 'Bhadro', 'Ashwin', 'Kartik', 'Agrahayan', 'Poush', 'Magh', 'Falgun', 'Choitro'];

// [gregMonth, gregDay] when each Bangla month starts (Bangladesh official calendar)
const BANGLA_STARTS: [number, number][] = [
	[4, 14],
	[5, 15],
	[6, 16],
	[7, 16],
	[8, 16],
	[9, 16],
	[10, 16],
	[11, 15],
	[12, 15],
	[1, 14],
	[2, 13],
	[3, 14]
];

export function toBanglaDate(date: Date): { day: number; monthBn: string; monthEn: string; year: number; monthIdx: number } {
	const y = date.getFullYear();
	const m = date.getMonth() + 1;
	const d = date.getDate();

	// Remap months so Bangla year (starting April) runs 4→15 instead of wrapping at 12
	const seq = (gm: number) => (gm < 4 ? gm + 12 : gm);
	const seqM = seq(m);

	let banglaMonthIdx = 0;
	let startYear = y;
	let startMonth = 4;
	let startDay = 14;

	for (let i = BANGLA_STARTS.length - 1; i >= 0; i--) {
		const [sm, sd] = BANGLA_STARTS[i];
		const seqSM = seq(sm);
		if (seqM > seqSM || (seqM === seqSM && d >= sd)) {
			banglaMonthIdx = i;
			// The matched start month can fall in the previous Gregorian year (e.g. today
			// is Jan 5, but the active Bangla month পৌষ started the previous December).
			startYear = sm > m ? y - 1 : y;
			startMonth = sm;
			startDay = sd;
			break;
		}
	}

	// Day-of-month subtraction (d - sd) only works when today and the start date
	// share a Gregorian month; otherwise it crosses a month boundary and goes
	// negative. Diff actual dates instead so the month length is accounted for.
	const banglaDay = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(startYear, startMonth - 1, startDay)) / 86400000) + 1;

	const banglaYear = m >= 4 ? y - 593 : y - 594;
	return {
		day: banglaDay,
		monthBn: BANGLA_MONTHS_BN[banglaMonthIdx],
		monthEn: BANGLA_MONTHS_EN[banglaMonthIdx],
		year: banglaYear,
		monthIdx: banglaMonthIdx
	};
}

export function countdownText(target: Date, now: Date): string {
	let diff = target.getTime() - now.getTime();
	if (diff < 0) diff += 86400000;
	const h = Math.floor(diff / 3600000);
	const m = Math.floor((diff % 3600000) / 60000);
	if (h > 0) return `${toBnNum(h)} ঘণ্টা ${toBnNum(m)} মিনিট বাকি`;
	return `${toBnNum(m)} মিনিট বাকি`;
}

/** Locale-agnostic countdown parts — caller composes the translated sentence. */
export function countdownParts(target: Date, now: Date): { hours: number; minutes: number } {
	let diff = target.getTime() - now.getTime();
	if (diff < 0) diff += 86400000;
	return { hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000) };
}
