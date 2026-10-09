<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '#lib/utils.ts';
	import { EditorState } from './state.svelte.ts';
	import Toolbar from './Toolbar.svelte';

	interface Props {
		value: string;
		placeholder?: string;
		/** Height classes of the scrolling area. */
		class?: string;
	}
	let { value = $bindable(), placeholder = 'Start writing...', class: className = 'h-[640px]' }: Props = $props();

	const s = new EditorState();
	let element = $state<HTMLDivElement>();
	let mode = $state<'edit' | 'preview'>('edit');
	let ready = $state(false);
	// The last HTML this editor emitted, so a parent echo is not mistaken for an external change.
	let emitted = value;

	onMount(() => {
		let detach = () => {};
		let destroy = () => {};
		let cancelled = false;
		// tiptap + ProseMirror are only fetched once an editor is on screen.
		import('./create-editor.ts').then(({ createEditor }) => {
			if (cancelled || !element) return;
			const editor = createEditor({
				element,
				content: value || '',
				placeholder,
				onUpdate: (html) => {
					emitted = html;
					value = html;
				}
			});
			detach = s.attach(editor);
			destroy = () => editor.destroy();
			ready = true;
		});
		return () => {
			cancelled = true;
			detach();
			destroy();
		};
	});

	// External changes (a different record loaded into the same form) replace the content.
	$effect(() => {
		const next = value;
		const editor = s.editor;
		if (!editor || next === emitted) return;
		emitted = next;
		editor.commands.setContent(next || '');
	});

	const previewHtml = $derived.by(() => {
		void s.tick;
		const html = s.editor?.getHTML() ?? '';
		return html === '<p></p>' || !html ? '<p style="color:var(--muted-foreground);opacity:0.6;font-size:0.875rem">Nothing to preview yet...</p>' : html;
	});
</script>

<div class="border border-border rounded-lg bg-card">
	{#if ready}
		<Toolbar {s} {mode} onmode={(m) => (mode = m)} />
	{:else}
		<div class="h-[46px] border-b border-border"></div>
	{/if}
	<div class={cn('overflow-y-auto', className, mode === 'preview' && 'hidden')} bind:this={element}></div>
	{#if mode === 'preview'}
		<div class={cn('overflow-y-auto bg-background/50 rounded-b-lg', className)}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="prose-content p-5">{@html previewHtml}</div>
		</div>
	{/if}
</div>
