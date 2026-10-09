import type { ModuleKey } from '#lib/modules.ts';
import type { MediaType } from '#lib/types.ts';
import type { EmptyIconName } from '../ui/icons.ts';

/** How a list cell renders; the table component switches on this. */
export type CellKind = 'position' | 'title' | 'author' | 'categories' | 'language' | 'location' | 'date' | 'longDate' | 'status' | 'audio' | 'offline';

export interface Column {
	kind: CellKind;
	label: string;
	/** API `sort` key; omit for an unsortable column. */
	sort?: string;
	/** Tailwind width class for the <col>; empty = the flexible column. */
	width: string;
}

interface Base {
	/** Key of the form value; also the payload key unless `payloadKey` says otherwise. */
	key: string;
	label?: string;
	/** Error toast when empty. Presence also adds the red asterisk. */
	required?: string;
	/** Red asterisk without a validation message (the field always has a value). */
	mark?: boolean;
	hint?: string;
	/** Shown only while this returns true (e.g. the audio file once "Has audio" is ticked). */
	when?: (values: Record<string, unknown>) => boolean;
}

export type FieldDef =
	| (Base & { kind: 'text'; placeholder?: string; maxLength?: number; nullable?: boolean })
	| (Base & { kind: 'textarea'; placeholder?: string; maxLength: number; rows: number; counter?: boolean })
	| (Base & { kind: 'language'; fallback: string })
	| (Base & { kind: 'position' })
	| (Base & { kind: 'date'; iso?: 'always' | 'nullable' })
	| (Base & { kind: 'author' })
	| (Base & { kind: 'categories' })
	| (Base & { kind: 'checkbox'; fallback: boolean })
	| (Base & { kind: 'rich'; placeholder: string; height: string; nullable?: boolean; trim?: boolean })
	| (Base & { kind: 'media'; accept: MediaType; placeholder: string });

/** One card of fields. An array entry renders its fields side by side. */
export interface Section {
	title?: string;
	requiredMark?: boolean;
	rows: (FieldDef | FieldDef[])[];
}

export interface TabDef {
	id: string;
	label: string;
	sections: Section[];
}

export interface ContentConfig {
	/** Route segment: `/admin/<slug>`. */
	slug: string;
	/** API collection: `/api/<api>`. */
	api: string;
	/** Detail endpoint for the editor (`id` filled in). */
	detail: (id: string) => string;
	/** Singular / plural display names. */
	singular: string;
	plural: string;
	/** Used in "Back to ..." and the search placeholder. */
	backLabel: string;
	/** Public-site path of an item, for the "Public View" button. */
	publicPath: string;
	/** Module key for category / author membership; absent when the content has no categories (news). */
	module?: ModuleKey;
	hasAuthor: boolean;
	hasOffline: boolean;
	defaultSort: string;
	columns: Column[];
	/** Empty-state icon name, see EmptyIcon. */
	icon: EmptyIconName;
	emptyHint: string;
	tabs: TabDef[];
	/** Show the "copy GUID" button in the title cell. */
	copyId?: boolean;
	/** Success toast name ("Article" → "Article created"). */
	toastName: string;
}
