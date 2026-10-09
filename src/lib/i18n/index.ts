export const LOCALES = ['bn', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'bn';

export const isLocale = (value: unknown): value is Locale => value === 'bn' || value === 'en';

/** One namespace of messages: nested strings, plus the odd string array (`t.raw('months')`). */
export type Namespace = { [key: string]: string | string[] | Namespace };
export type Messages = Record<string, Namespace>;
export type Vars = Record<string, string | number>;

const numberFormats: Partial<Record<Locale, Intl.NumberFormat>> = {};

const formatNumber = (value: number, locale: Locale) => (numberFormats[locale] ??= new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US')).format(value);

const pluralRules: Partial<Record<Locale, Intl.PluralRules>> = {};

/** Index of the `}` closing the `{` at `open` (message text nests braces one or two levels deep). */
function closingBrace(text: string, open: number): number {
	let depth = 0;
	for (let i = open; i < text.length; i++) {
		if (text[i] === '{') depth++;
		else if (text[i] === '}' && --depth === 0) return i;
	}
	return -1;
}

/** Resolves one `{name, plural, one {...} other {...}}` block (`=N` branches and `#` supported). */
function formatPlural(body: string, count: number, locale: Locale, vars: Vars): string {
	const branches = new Map<string, string>();
	for (let i = 0; i < body.length;) {
		const open = body.indexOf('{', i);
		if (open < 0) break;
		const close = closingBrace(body, open);
		if (close < 0) break;
		branches.set(body.slice(i, open).trim(), body.slice(open + 1, close));
		i = close + 1;
	}
	const category = (pluralRules[locale] ??= new Intl.PluralRules(locale === 'bn' ? 'bn-BD' : 'en-US')).select(count);
	const text = branches.get(`=${count}`) ?? branches.get(category) ?? branches.get('other') ?? '';
	return interpolate(text.replaceAll('#', formatNumber(count, locale)), vars, locale);
}

/** Fills `{name}`, `{name, number}` and `{name, plural, ...}` placeholders (the ICU forms the message files use). */
export function interpolate(message: string, vars: Vars | undefined, locale: Locale): string {
	if (!vars || !message.includes('{')) return message;
	let out = '';
	let last = 0;
	for (let open = message.indexOf('{'); open >= 0; open = message.indexOf('{', last)) {
		const close = closingBrace(message, open);
		if (close < 0) break;
		out += message.slice(last, open);
		const [name, kind, ...rest] = message.slice(open + 1, close).split(',');
		const value = vars[name.trim()];
		if (value === undefined) out += message.slice(open, close + 1);
		else if (kind?.trim() === 'plural')
			out += formatPlural(
				rest
					.join(',')
					.trim()
					.replace(/^plural,/, ''),
				Number(value),
				locale,
				vars
			);
		else out += kind?.trim() === 'number' && typeof value === 'number' ? formatNumber(value, locale) : String(value);
		last = close + 1;
	}
	return out + message.slice(last);
}

function lookup(ns: Namespace | undefined, key: string): string | string[] | undefined {
	let node: Namespace | string | string[] | undefined = ns;
	for (const part of key.split('.')) {
		if (node === undefined || typeof node === 'string' || Array.isArray(node)) return undefined;
		node = node[part];
	}
	return node as string | string[] | undefined;
}

export interface Translator {
	(key: string, vars?: Vars): string;
	/** The raw value, for message arrays such as month names. */
	raw<T = string[]>(key: string): T;
}

export function createTranslator(ns: Namespace | undefined, locale: Locale): Translator {
	const t = ((key: string, vars?: Vars) => {
		const message = lookup(ns, key);
		return typeof message === 'string' ? interpolate(message, vars, locale) : key;
	}) as Translator;
	t.raw = <T>(key: string) => lookup(ns, key) as T;
	return t;
}
