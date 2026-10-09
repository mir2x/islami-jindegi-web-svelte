<script lang="ts">
	import type { Component } from 'svelte';
	import AlignCenter from '@lucide/svelte/icons/align-center';
	import AlignJustify from '@lucide/svelte/icons/align-justify';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import AlignRight from '@lucide/svelte/icons/align-right';
	import Bold from '@lucide/svelte/icons/bold';
	import Code from '@lucide/svelte/icons/code';
	import Columns3 from '@lucide/svelte/icons/columns-3';
	import Eye from '@lucide/svelte/icons/eye';
	import Heading1 from '@lucide/svelte/icons/heading-1';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Heading3 from '@lucide/svelte/icons/heading-3';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Italic from '@lucide/svelte/icons/italic';
	import LinkIcon from '@lucide/svelte/icons/link';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Minus from '@lucide/svelte/icons/minus';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import Quote from '@lucide/svelte/icons/quote';
	import Redo from '@lucide/svelte/icons/redo';
	import Rows3 from '@lucide/svelte/icons/rows-3';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import TableIcon from '@lucide/svelte/icons/table';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Underline from '@lucide/svelte/icons/underline';
	import Undo from '@lucide/svelte/icons/undo';
	import type { Editor } from '@tiptap/core';
	import { toast } from '../toast.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import ColorSelect from './ColorSelect.svelte';
	import FontSizeSelect from './FontSizeSelect.svelte';
	import SpacingSelect from './SpacingSelect.svelte';
	import { LINE_HEIGHT, WORD_SPACING } from './spacing.ts';
	import type { EditorState } from './state.svelte.ts';
	import ToolButton from './ToolButton.svelte';
	import { uploadEditorImage } from './upload.ts';

	interface Props {
		s: EditorState;
		mode: 'edit' | 'preview';
		onmode: (mode: 'edit' | 'preview') => void;
	}
	let { s, mode, onmode }: Props = $props();

	interface Btn {
		title: string;
		icon: Component<{ class?: string }>;
		/** Active-state probe: a mark/node name, optionally with attributes. */
		on?: [string | Record<string, unknown>, Record<string, unknown>?];
		do: (e: Editor) => void;
		/** Undo/redo: disabled when unavailable, and not recorded for F4. */
		history?: 'undo' | 'redo';
	}

	const chain = (e: Editor) => e.chain().focus();
	// Groups are separated by a divider; the font/colour/spacing menus slot in between them below.
	const history: Btn[] = [
		{ title: 'Undo (Ctrl+Z)', icon: Undo, history: 'undo', do: (e) => chain(e).undo().run() },
		{ title: 'Redo (Ctrl+Y)', icon: Redo, history: 'redo', do: (e) => chain(e).redo().run() }
	];
	const headings: Btn[] = [1, 2, 3].map((level) => ({
		title: `Heading ${level}`,
		icon: [Heading1, Heading2, Heading3][level - 1],
		on: ['heading', { level }],
		do: (e: Editor) =>
			chain(e)
				.toggleHeading({ level: level as 1 | 2 | 3 })
				.run()
	}));
	const marks: Btn[] = [
		{ title: 'Bold (Ctrl+B)', icon: Bold, on: ['bold'], do: (e) => chain(e).toggleBold().run() },
		{ title: 'Italic (Ctrl+I)', icon: Italic, on: ['italic'], do: (e) => chain(e).toggleItalic().run() },
		{ title: 'Underline (Ctrl+U)', icon: Underline, on: ['underline'], do: (e) => chain(e).toggleUnderline().run() },
		{ title: 'Strikethrough', icon: Strikethrough, on: ['strike'], do: (e) => chain(e).toggleStrike().run() },
		{ title: 'Code', icon: Code, on: ['code'], do: (e) => chain(e).toggleCode().run() },
		{
			title: 'Link',
			icon: LinkIcon,
			on: ['link'],
			do: (e) => {
				const url = window.prompt('Enter URL');
				if (url) chain(e).setLink({ href: url }).run();
			}
		}
	];
	const aligns: Btn[] = (['left', 'center', 'right', 'justify'] as const).map((a, i) => ({
		title: `Align ${a[0].toUpperCase()}${a.slice(1)}`,
		icon: [AlignLeft, AlignCenter, AlignRight, AlignJustify][i],
		on: [{ textAlign: a }],
		do: (e: Editor) => chain(e).setTextAlign(a).run()
	}));
	const blocks: Btn[] = [
		{ title: 'Bullet List', icon: List, on: ['bulletList'], do: (e) => chain(e).toggleBulletList().run() },
		{ title: 'Numbered List', icon: ListOrdered, on: ['orderedList'], do: (e) => chain(e).toggleOrderedList().run() },
		{ title: 'Blockquote', icon: Quote, on: ['blockquote'], do: (e) => chain(e).toggleBlockquote().run() },
		{ title: 'Code Block', icon: Code, on: ['codeBlock'], do: (e) => chain(e).toggleCodeBlock().run() },
		{ title: 'Horizontal Rule', icon: Minus, do: (e) => chain(e).setHorizontalRule().run() }
	];
	const tableOps: Btn[] = [
		{ title: 'Add Row', icon: Rows3, do: (e) => chain(e).addRowAfter().run() },
		{ title: 'Add Column', icon: Columns3, do: (e) => chain(e).addColumnAfter().run() },
		{ title: 'Delete Table', icon: Trash2, do: (e) => chain(e).deleteTable().run() }
	];

	let fileInput = $state<HTMLInputElement>();
	const inTable = $derived(s.active('table'));

	async function insertImage(file: File) {
		try {
			const src = await uploadEditorImage(file);
			s.run((e) => chain(e).setImage({ src }).run());
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Image upload failed');
		}
	}

	const modeBtn = 'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors';
</script>

{#snippet group(buttons: Btn[])}
	{#each buttons as b (b.title)}
		<ToolButton
			title={b.title}
			active={b.on ? s.active(...b.on) : false}
			disabled={b.history ? !s.can(b.history) : false}
			onclick={() => (b.history ? s.editor && b.do(s.editor) : s.run(b.do))}
		>
			<b.icon class="w-3.5 h-3.5" />
		</ToolButton>
	{/each}
{/snippet}

{#snippet divider()}<div class="w-px h-5 bg-border mx-0.5 shrink-0"></div>{/snippet}

<!-- Sticky so it stays visible while the page scrolls. -->
<div class="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-lg">
	{@render group(history)}
	{@render divider()}
	{@render group(headings)}
	{@render divider()}
	<FontSizeSelect {s} />
	<ColorSelect {s} />
	{@render divider()}
	{@render group(marks)}
	{@render divider()}
	{@render group(aligns)}
	{@render divider()}
	<ToolButton title="Left to Right (LTR)" active={s.active({ dir: 'ltr' })} onclick={() => s.run((e) => chain(e).setTextDirection('ltr').run())}>
		<svg viewBox="0 0 16 16" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"
			><line x1="1" y1="4" x2="10" y2="4" /><line x1="1" y1="8" x2="8" y2="8" /><line x1="1" y1="12" x2="10" y2="12" /><polyline
				points="12,6 15,8 12,10"
				fill="currentColor"
				stroke="none"
			/><line x1="11" y1="8" x2="15" y2="8" /></svg
		>
	</ToolButton>
	<ToolButton title="Right to Left (RTL): Arabic / Urdu" active={s.active({ dir: 'rtl' })} onclick={() => s.run((e) => chain(e).setTextDirection('rtl').run())}>
		<svg viewBox="0 0 16 16" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"
			><line x1="6" y1="4" x2="15" y2="4" /><line x1="8" y1="8" x2="15" y2="8" /><line x1="6" y1="12" x2="15" y2="12" /><polyline
				points="4,6 1,8 4,10"
				fill="currentColor"
				stroke="none"
			/><line x1="1" y1="8" x2="5" y2="8" /></svg
		>
	</ToolButton>
	{@render divider()}
	<SpacingSelect {s} spec={LINE_HEIGHT} />
	<SpacingSelect {s} spec={WORD_SPACING} />
	{@render divider()}
	{@render group(blocks)}
	{@render divider()}
	<ToolButton title="Insert Table" active={inTable} onclick={() => s.run((e) => chain(e).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
		><TableIcon class="w-3.5 h-3.5" /></ToolButton
	>
	{#if inTable}{@render group(tableOps)}{/if}
	{@render divider()}
	<ToolButton title="Insert Image" onclick={() => fileInput?.click()}><ImageIcon class="w-3.5 h-3.5" /></ToolButton>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={(e) => {
			const file = e.currentTarget.files?.[0];
			if (file) insertImage(file);
			e.currentTarget.value = '';
		}}
	/>

	<div class="ml-auto flex items-center gap-0.5 border border-border rounded-md p-0.5">
		<button
			type="button"
			onmousedown={(e) => {
				e.preventDefault();
				onmode('edit');
			}}
			class={cn(modeBtn, mode === 'edit' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}><PenLine class="w-3 h-3" />Edit</button
		>
		<button
			type="button"
			onmousedown={(e) => {
				e.preventDefault();
				onmode('preview');
			}}
			class={cn(modeBtn, mode === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}><Eye class="w-3 h-3" />Preview</button
		>
	</div>
</div>
