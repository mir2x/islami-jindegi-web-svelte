<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { onMount } from 'svelte';
	import { CONTENT_MODULES } from '#lib/modules.ts';
	import type { Category } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { lookups } from '../lookups.svelte.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import { inputCls } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import Select from '../ui/Select.svelte';
	import ConflictBanner from './ConflictBanner.svelte';
	import ModuleChecks from './ModuleChecks.svelte';

	interface Props {
		category?: Category | null;
		defaultParentId?: string;
	}
	let { category = null, defaultParentId = '' }: Props = $props();

	// Mirrors the API's unique index, which is on the normalised title.
	const norm = (s: string) => s.trim().replace(/[‘’]/g, "'").normalize('NFC');

	// svelte-ignore state_referenced_locally
	let title = $state(category?.title ?? '');
	// svelte-ignore state_referenced_locally
	let parentId = $state(category?.parentId ?? defaultParentId);
	// svelte-ignore state_referenced_locally
	let modules = $state<string[]>(category?.modules?.map((m) => m.module) ?? []);
	let conflict = $state<string | null>(null);
	let saving = $state(false);

	onMount(() => void lookups.ensureCategories());

	const parentOptions = $derived([
		{ value: '', label: '— Top-level category' },
		...lookups.categories.filter((c) => !c.parentId && c.id !== category?.id).map((c) => ({ value: c.id, label: c.title }))
	]);
	/** The existing category a rejected rename collided with, so we can offer to merge into it. */
	const conflictTarget = $derived(
		conflict ? (lookups.categories.flatMap((c) => [c, ...c.children]).find((c) => norm(c.title) === norm(title) && c.id !== category?.id) ?? null) : null
	);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return toast.error('Title is required');
		saving = true;
		conflict = null;
		try {
			const payload = { title: title.trim(), parentId: parentId || null, modules };
			if (category) await api.put(`/api/categories/${category.id}`, payload);
			else await api.post('/api/categories', payload);
			toast.success(category ? 'Category updated' : 'Category created');
			goBack('/admin/categories');
		} catch (err) {
			// A duplicate title is the common case: staff used to consolidate categories by renaming one onto another.
			if (err instanceof ApiError && err.status === 409) conflict = err.message;
			else toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
		} finally {
			saving = false;
		}
	}

	async function merge() {
		if (!category || !conflictTarget) return;
		saving = true;
		try {
			await api.post(`/api/categories/${category.id}/merge`, { targetId: conflictTarget.id });
			toast.success(`Merged into "${conflictTarget.title}"`);
			goBack('/admin/categories');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Merge failed');
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-xl mx-auto p-4 sm:p-5">
	<div class="mb-4">
		<button type="button" onclick={() => goBack('/admin/categories')} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
			><ArrowLeft class="w-4 h-4" /> Back</button
		>
		<h1 class="text-2xl font-bold">{category ? 'Edit Category' : 'Add New Category'}</h1>
		<p class="text-sm text-muted-foreground mt-1">{category ? `Editing "${category.title}"` : 'Fill in the details to add a new category'}</p>
	</div>

	<form onsubmit={submit} class="space-y-4">
		<Card title="Details">
			<Field label="Title" required><input bind:value={title} placeholder="Category title" maxlength={100} class={inputCls} /></Field>
			<Field label="Parent Category"><Select bind:value={parentId} options={parentOptions} /></Field>
		</Card>

		<ModuleChecks modules={CONTENT_MODULES} bind:selected={modules} memberships={category?.modules} noun="category" reorderHref="/admin/categories/reorder" />

		{#if conflict}<ConflictBanner heading="Duplicate title" message={conflict} mergeInto={category ? (conflictTarget?.title ?? null) : null} busy={saving} onmerge={merge} />{/if}

		<div class="flex gap-3">
			<Button type="submit" disabled={saving} class="sm:px-8">{saving ? 'Saving...' : category ? 'Update Category' : 'Create Category'}</Button>
			<Button variant="outline" onclick={() => goBack('/admin/categories')}>Cancel</Button>
		</div>
	</form>
</div>
