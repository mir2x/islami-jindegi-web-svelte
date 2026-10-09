import { createTranslator, type Locale, type Messages, type Translator } from '#lib/i18n/index.ts';
import bnAdmin from '../../messages/bn/admin.json';
import bnCommon from '../../messages/bn/common.json';
import bnPublic from '../../messages/bn/public.json';
import bnReader from '../../messages/bn/reader.json';
import enAdmin from '../../messages/en/admin.json';
import enCommon from '../../messages/en/common.json';
import enPublic from '../../messages/en/public.json';
import enReader from '../../messages/en/reader.json';

const ALL: Record<Locale, Messages> = {
	bn: { ...bnCommon, ...bnPublic, ...bnReader, ...bnAdmin } as unknown as Messages,
	en: { ...enCommon, ...enPublic, ...enReader, ...enAdmin } as unknown as Messages
};

/** Namespaces every page needs (header, footer, share/toolbar chrome). */
export const CHROME_NAMESPACES = ['Metadata', 'Common', 'Nav', 'Footer', 'ThemeToggle', 'ShareMenu', 'DetailToolbar'];

/** The requested namespaces of one locale, for sending to the client with the page data. */
export function loadMessages(locale: Locale, ...namespaces: string[]): Messages {
	const all = ALL[locale];
	const out: Messages = {};
	for (const ns of namespaces) if (all[ns]) out[ns] = all[ns];
	return out;
}

/** Server-side translator, for titles, descriptions and other markup built in `load`. */
export function getT(locale: Locale, namespace: string): Translator {
	return createTranslator(ALL[locale][namespace], locale);
}
