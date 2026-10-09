import { Editor } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';
import { RepeatLastAction, Spacing, TextDirection } from './extensions.ts';

interface Options {
	element: HTMLElement;
	content: string;
	placeholder: string;
	onUpdate: (html: string) => void;
}

/** Kept in its own module so tiptap (and ProseMirror) load only when an editor is on screen. */
export function createEditor({ element, content, placeholder, onUpdate }: Options): Editor {
	return new Editor({
		element,
		content,
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3, 4] },
				bulletList: { keepMarks: true },
				orderedList: { keepMarks: true },
				link: { openOnClick: false, autolink: true }
			}),
			TextStyle,
			FontSize,
			Color,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			TextDirection,
			Spacing,
			Table.configure({ resizable: true }),
			TableRow,
			TableHeader,
			TableCell,
			Image.configure({ allowBase64: false, inline: false }),
			Placeholder.configure({ placeholder }),
			RepeatLastAction
		],
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onUpdate(html === '<p></p>' ? '' : html);
		}
	});
}
