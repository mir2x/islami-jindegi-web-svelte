import { bn } from './bengali-numerals.ts';
import { currentLocale } from './i18n/use-t.svelte.ts';

/** Formats a number in the active locale's digits (Bengali numerals for `bn`). */
export const useNum = () => (value: number | string) => (currentLocale() === 'bn' ? bn(value) : String(value));
