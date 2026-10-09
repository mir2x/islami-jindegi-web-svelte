import { bn } from './bengali-numerals.ts';

/**
 * Deterministic display dates.
 *
 * `Intl.DateTimeFormat('bn-BD')` is not safe to render on both the server and the client: Node's
 * and the browser's ICU data differ ("ফেব্রুয়ারী" vs "ফেব্রুয়ারি"), so every January/February date
 * failed hydration and made React throw the page's server HTML away. Month names are therefore
 * fixed here, digits go through `bn()`, and the calendar day is read in one fixed zone so a server
 * in UTC and a browser in Dhaka cannot disagree about which day an instant falls on.
 */

const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const BN_MONTHS_SHORT = ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EN_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TIME_ZONE = 'Asia/Dhaka';
// en-US + numeric parts: Latin digits, identical in every runtime.
const dayParts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: 'numeric', day: 'numeric' });

export interface FormatDateOptions {
	/** `long` spells the month out; `short` abbreviates it. Default `long`. */
	month?: 'long' | 'short';
	/** Include the year. Default true. */
	year?: boolean;
	/** Bangla list rows read "month day, year"; everywhere else the day comes first. Default `day-first`. */
	order?: 'day-first' | 'month-first';
}

export function formatDate(value: string | number | Date, locale: string, { month = 'long', year = true, order = 'day-first' }: FormatDateOptions = {}): string {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';

	const parts = dayParts.formatToParts(date);
	const get = (type: 'year' | 'month' | 'day') => Number(parts.find((p) => p.type === type)?.value);
	const y = get('year'),
		m = get('month') - 1,
		d = get('day');

	const isBn = locale === 'bn';
	const monthName = (isBn ? (month === 'short' ? BN_MONTHS_SHORT : BN_MONTHS) : month === 'short' ? EN_MONTHS_SHORT : EN_MONTHS)[m];
	const dayText = isBn ? bn(d) : String(d);
	const yearText = isBn ? bn(y) : String(y);

	if (!isBn || order === 'month-first') {
		return year ? `${monthName} ${dayText}, ${yearText}` : `${monthName} ${dayText}`;
	}
	return year ? `${dayText} ${monthName}, ${yearText}` : `${dayText} ${monthName}`;
}
