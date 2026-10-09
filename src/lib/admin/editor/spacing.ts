import type { Editor } from '@tiptap/core';
import { SPACING_TYPES } from './extensions.ts';

export type SpacingAttr = 'lineHeight' | 'wordSpacing';

export interface SpacingSpec {
	attr: SpacingAttr;
	title: string;
	presets: number[];
	step: number;
	min: number;
	max: number;
	/** Value in effect when the attribute is unset (from the editor CSS). */
	fallback: (editor: Editor) => number;
	toCss: (value: number) => string | null;
	label: (value: number) => string;
}

export const LINE_HEIGHT: SpacingSpec = {
	attr: 'lineHeight',
	title: 'Line Spacing',
	presets: [1, 1.15, 1.5, 1.75, 2, 2.5, 3],
	step: 0.25,
	min: 0.8,
	max: 5,
	fallback: (editor) => (editor.isActive('heading') ? 1.3 : 1.75),
	toCss: (value) => String(value),
	label: (value) => String(value)
};

export const WORD_SPACING: SpacingSpec = {
	attr: 'wordSpacing',
	title: 'Word Spacing',
	presets: [-2, 0, 2, 4, 6, 8, 12],
	step: 1,
	min: -5,
	max: 40,
	fallback: () => 0,
	toCss: (value) => (value === 0 ? null : `${value}px`),
	label: (value) => `${value}px`
};

export function setBlockSpacing(editor: Editor, attr: SpacingAttr, value: string | null) {
	let chain = editor.chain().focus();
	for (const type of SPACING_TYPES) chain = chain.updateAttributes(type, { [attr]: value });
	chain.run();
}

export function currentSpacing(editor: Editor, spec: SpacingSpec): number {
	const type = editor.isActive('heading') ? 'heading' : 'paragraph';
	const value = parseFloat(editor.getAttributes(type)[spec.attr]);
	return isNaN(value) ? spec.fallback(editor) : value;
}
