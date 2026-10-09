import { Extension, type Editor } from '@tiptap/core';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		textDirection: {
			setTextDirection: (dir: 'ltr' | 'rtl') => ReturnType;
			unsetTextDirection: () => ReturnType;
		};
	}
}

export type EditorAction = (editor: Editor) => void;

// Adds dir="ltr"|"rtl" to block nodes.
const TEXT_DIR_TYPES = ['paragraph', 'heading', 'listItem', 'bulletList', 'orderedList'];

export const TextDirection = Extension.create({
	name: 'textDirection',
	addGlobalAttributes() {
		return [
			{
				types: TEXT_DIR_TYPES,
				attributes: {
					dir: {
						default: null,
						parseHTML: (el) => el.getAttribute('dir') || null,
						renderHTML: (attrs) => (attrs.dir ? { dir: attrs.dir } : {})
					}
				}
			}
		];
	},
	addCommands() {
		return {
			setTextDirection:
				(dir) =>
				({ commands }) =>
					TEXT_DIR_TYPES.every((type) => commands.updateAttributes(type, { dir })),
			unsetTextDirection:
				() =>
				({ commands }) =>
					TEXT_DIR_TYPES.every((type) => commands.updateAttributes(type, { dir: null }))
		};
	}
});

// Line height and word spacing on block nodes, stored as inline styles. Mainly for Arabic, which needs extra
// line height for harakat. Horizontal spacing is word spacing, not letter spacing: letter spacing breaks Arabic joins.
export const SPACING_TYPES = ['paragraph', 'heading'];

export const Spacing = Extension.create({
	name: 'spacing',
	addGlobalAttributes() {
		return [
			{
				types: SPACING_TYPES,
				attributes: {
					lineHeight: {
						default: null,
						parseHTML: (el) => el.style.lineHeight || null,
						renderHTML: (attrs) => (attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {})
					},
					wordSpacing: {
						default: null,
						parseHTML: (el) => el.style.wordSpacing || null,
						renderHTML: (attrs) => (attrs.wordSpacing ? { style: `word-spacing: ${attrs.wordSpacing}` } : {})
					}
				}
			}
		];
	}
});

type RepeatStorage = { last: EditorAction | null };
const repeatStorage = (editor: Editor) => (editor.storage as unknown as { repeatLastAction: RepeatStorage }).repeatLastAction;

/** Runs a command and remembers it for F4. */
export function runAndRecord(editor: Editor, action: EditorAction) {
	repeatStorage(editor).last = action;
	action(editor);
}

// Word-style F4: repeats the last editing command (formatting, alignment, lists, inserts…) on the current selection.
export const RepeatLastAction = Extension.create({
	name: 'repeatLastAction',
	priority: 1000,
	addStorage() {
		return { last: null as EditorAction | null };
	},
	addKeyboardShortcuts() {
		const recorded =
			(action: EditorAction) =>
			({ editor }: { editor: Editor }) => {
				runAndRecord(editor, action);
				return true;
			};
		return {
			F4: ({ editor }) => {
				repeatStorage(editor).last?.(editor);
				return true;
			},
			'Mod-b': recorded((e) => e.chain().focus().toggleBold().run()),
			'Mod-i': recorded((e) => e.chain().focus().toggleItalic().run()),
			'Mod-u': recorded((e) => e.chain().focus().toggleUnderline().run()),
			'Mod-Shift-s': recorded((e) => e.chain().focus().toggleStrike().run())
		};
	}
});
