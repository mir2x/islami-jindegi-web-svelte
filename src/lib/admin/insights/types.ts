/** What `/api/insights` returns; shared by the server queries and the admin page. */
export type RangeId = '7d' | '30d';

export interface Point {
	/** Day, `YYYY-MM-DD` (UTC). */
	x: string;
	y: number;
}
export interface Slice {
	label: string;
	value: number;
}

export interface Overview {
	/** Best single guess at real people per day, and the range it most likely lies in. */
	readers: { mid: number; low: number; high: number };
	/** The same for the period before, or null when there is no earlier data. */
	previous: { mid: number; pageViews: number } | null;
	pageViews: number;
	bangladeshVisitors: number;
	/** Page loads reported by real browsers (the JavaScript beacon); only exists since it was switched on. */
	browserLoads: number | null;
	readersByDay: Point[];
	pageViewsByDay: Point[];
}

export interface Audience {
	countries: Slice[];
	devices: Slice[];
	browsers: Slice[];
	systems: Slice[];
	languages: Slice[];
	referrers: Slice[];
	pages: Slice[];
}

export type Level = 'ok' | 'warn' | 'bad';
export interface Check {
	id: string;
	level: Level;
	/** Value to show beside the label ("0.2 %", "41 ms"); the words come from translations. */
	value: string;
}
export interface Health {
	level: Level;
	checks: Check[];
	errorsByDay: Point[];
}

export interface Technical {
	botShare: number;
	botRequests: number;
	scannerProbes: number;
	notFound: number;
	slowPages: Slice[];
	missing: Slice[];
	scanners: Slice[];
	crawlers: Slice[];
	noisyIps: Slice[];
	statusClasses: Slice[];
	recentFailures: { time: string; status: number; method: string; uri: string; country: string; ip: string }[];
}

export interface Insights {
	range: RangeId;
	generatedAt: string;
	overview: Overview;
	audience: Audience;
	health: Health;
	technical: Technical;
}
