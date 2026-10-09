<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { AUTHOR_MODULES } from '#lib/modules.ts';
	import type { Author } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import RichEditor from '../editor/RichEditor.svelte';
	import { lookups } from '../lookups.svelte.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import ConflictBanner from './ConflictBanner.svelte';
	import ModuleChecks from './ModuleChecks.svelte';

	let { author = null }: { author?: Author | null } = $props();

	// Mirrors the API's unique index, which is on the normalised name.
	const norm = (s: string) =>
		s
			.trim()
			.replace(/[​‌‍﻿]/g, '')
			.replace(/[‘’]/g, "'")
			.normalize('NFC');

	// svelte-ignore state_referenced_locally
	let name = $state(author?.name ?? '');
	// svelte-ignore state_referenced_locally
	let info = $state(author?.info ?? '');
	// svelte-ignore state_referenced_locally
	let position = $state(author ? String(author.position) : '');
	// svelte-ignore state_referenced_locally
	let modules = $state<string[]>(author?.modules?.map((m) => m.module) ?? []);
	let conflict = $state<string | null>(null);
	let saving = $state(false);

	onMount(() => void lookups.ensureAuthors());

	/** The existing author a rejected rename collided with, so we can offer to merge into them. */
	const conflictTarget = $derived(conflict ? (lookups.authors.find((a) => norm(a.name) === norm(name) && a.id !== author?.id) ?? null) : null);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return toast.error('Name is required');
		saving = true;
		conflict = null;
		try {
			const payload = { name: name.trim(), info: info || null, position: position ? parseInt(position) : undefined, modules };
			if (author) await api.put(`/api/authors/${author.id}`, payload);
			else await api.post('/api/authors', payload);
			toast.success(author ? 'Author updated' : 'Author created');
			lookups.invalidate('authors');
			goBack('/admin/authors');
		} catch (err) {
			// A duplicate name is the common case: staff used to consolidate authors by renaming one onto another, which moves no content.
			if (err instanceof ApiError && err.status === 409) conflict = err.message;
			else toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
		} finally {
			saving = false;
		}
	}

	async function merge() {
		if (!author || !conflictTarget) return;
		saving = true;
		try {
			await api.post(`/api/authors/${author.id}/merge`, { targetId: conflictTarget.id });
			toast.success(`Merged into "${conflictTarget.name}"`);
			lookups.invalidate('authors');
			goBack('/admin/authors');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Merge failed');
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-5xl mx-auto p-4 sm:p-5">
	<div class="mb-4">
		<button type="button" onclick={() => goBack('/admin/authors')} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
			><ArrowLeft class="w-4 h-4" /> Back</button
		>
		<h1 class="text-2xl font-bold">{author ? 'Edit Author' : 'Add New Author'}</h1>
		<p class="text-sm text-muted-foreground mt-1">{author ? `Editing "${author.name}"` : 'Fill in the details to add a new author'}</p>
	</div>

	<form onsubmit={submit} class="space-y-4">
		<Card title="Basic Information">
			<Field label="Name" required><input bind:value={name} placeholder="Author name" maxlength={150} class={inputCls} /></Field>
			<Field label="Position">
				<input type="number" min="1" bind:value={position} placeholder="Auto" class={inp('w-40')} />
				<p class="text-xs text-muted-foreground">Only orders this admin list. What readers see is the per-module order below.</p>
			</Field>
		</Card>

		<ModuleChecks modules={AUTHOR_MODULES} bind:selected={modules} memberships={author?.modules} noun="author" reorderHref="/admin/authors/reorder" />

		<Card title="Bio" class="space-y-3"><RichEditor bind:value={info} placeholder="Short bio or description..." /></Card>

		{#if conflict}<ConflictBanner heading="Duplicate name" message={conflict} mergeInto={author ? (conflictTarget?.name ?? null) : null} busy={saving} onmerge={merge} />{/if}

		<div class="flex gap-3">
			<Button type="submit" disabled={saving} class="sm:px-8">{saving ? 'Saving...' : author ? 'Update Author' : 'Create Author'}</Button>
			<Button variant="outline" onclick={() => goBack('/admin/authors')}>Cancel</Button>
		</div>
	</form>
</div>
