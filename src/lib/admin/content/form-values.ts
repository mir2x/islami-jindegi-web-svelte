import type { ContentConfig, FieldDef } from './types.ts';

export type Values = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const fieldsOf = (config: ContentConfig): { tab: string; field: FieldDef }[] =>
	config.tabs.flatMap((t) => t.sections.flatMap((s) => s.rows.flat().map((field) => ({ tab: t.id, field }))));

/** Form values for a record (or the defaults for a new one). The item comes straight from the admin detail endpoint. */
export function initialValues(config: ContentConfig, item: Record<string, any> | null): Values {
	const v: Values = {};
	for (const { field: f } of fieldsOf(config)) {
		switch (f.kind) {
			case 'language':
				v[f.key] = item?.language ?? f.fallback;
				break;
			case 'checkbox':
				v[f.key] = item?.[f.key] ?? f.fallback;
				break;
			case 'position':
				v[f.key] = item?.position != null ? String(item.position) : '';
				break;
			case 'date':
				v[f.key] = item?.[f.key]?.split('T')[0] ?? '';
				break;
			case 'author':
				v[f.key] = item?.author?.id ?? '';
				break;
			case 'categories':
				v[f.key] = (item?.categories ?? []).map((c: { id: string }) => c.id);
				break;
			default:
				v[f.key] = item?.[f.key] ?? '';
		}
	}
	return v;
}

const isEmpty = (f: FieldDef, value: unknown) => (f.kind === 'checkbox' ? false : Array.isArray(value) ? value.length === 0 : !String(value ?? '').trim());

/** The first missing required field, as `{ tab, message }`. */
export function firstError(config: ContentConfig, values: Values): { tab: string; message: string } | null {
	for (const { tab, field: f } of fieldsOf(config)) if (f.required && isEmpty(f, values[f.key])) return { tab, message: f.required };
	return null;
}

function toPayload(f: FieldDef, v: unknown): unknown {
	switch (f.kind) {
		case 'text':
			return f.required ? String(v).trim() : f.nullable ? v || null : v;
		case 'textarea':
		case 'media':
			return v || null;
		case 'language':
		case 'checkbox':
		case 'categories':
			return v;
		case 'position':
			return v ? parseInt(String(v)) : undefined;
		case 'date':
			return v ? new Date(String(v)).toISOString() : null;
		case 'author':
			return v || null;
		case 'rich':
			return f.trim ? String(v).trim() : f.nullable ? v || null : v;
	}
}

export function buildPayload(config: ContentConfig, values: Values): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const { field: f } of fieldsOf(config)) out[f.key] = toPayload(f, values[f.key]);
	return out;
}
