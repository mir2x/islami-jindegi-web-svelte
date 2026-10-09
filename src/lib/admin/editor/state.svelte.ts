import type { Editor } from '@tiptap/core';
import { runAndRecord, type EditorAction } from './extensions.ts';

/** Reactive view of a tiptap editor for the toolbar: every transaction bumps `tick`, which the readers below depend on. */
export class EditorState {
	editor = $state.raw<Editor | null>(null);
	tick = $state(0);

	attach(editor: Editor): () => void {
		this.editor = editor;
		const bump = () => this.tick++;
		editor.on('selectionUpdate', bump);
		editor.on('transaction', bump);
		return () => {
			editor.off('selectionUpdate', bump);
			editor.off('transaction', bump);
		};
	}

	active = (name: string | Record<string, unknown>, attrs?: Record<string, unknown>): boolean => {
		void this.tick;
		return this.editor ? (typeof name === 'string' ? this.editor.isActive(name, attrs) : this.editor.isActive(name)) : false;
	};

	attrs = (name: string): Record<string, string | null> => {
		void this.tick;
		return this.editor?.getAttributes(name) ?? {};
	};

	can = (command: 'undo' | 'redo'): boolean => {
		void this.tick;
		return this.editor?.can()[command]() ?? false;
	};

	/** Runs a command and records it for F4 (repeat last action). */
	run = (action: EditorAction) => {
		if (this.editor) runAndRecord(this.editor, action);
	};
}
