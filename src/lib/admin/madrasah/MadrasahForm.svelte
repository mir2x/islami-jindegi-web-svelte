<script lang="ts">
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { MadrasahDetail } from '#lib/types.ts';
	import RichEditor from '../editor/RichEditor.svelte';
	import MediaField from '../media/MediaField.svelte';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import { inputCls, sectionTitleCls, textareaCls, inp } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import FormFrame from '../ui/FormFrame.svelte';
	import { saveForm } from '../ui/save.ts';

	let { item = null }: { item?: MadrasahDetail | null } = $props();

	interface Info {
		key: string;
		label: string;
		info: string;
	}
	interface Photo {
		key: string;
		title: string;
		imageUrl: string;
	}
	const strip = (html: string) =>
		html
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	// svelte-ignore state_referenced_locally
	let title = $state(item?.title ?? '');
	// svelte-ignore state_referenced_locally
	let excerpt = $state(item?.excerpt ?? '');
	// svelte-ignore state_referenced_locally
	let introduction = $state(item?.introduction ?? '');
	// svelte-ignore state_referenced_locally
	let position = $state(item ? String(item.position) : '');
	// svelte-ignore state_referenced_locally
	let infos = $state<Info[]>(item?.infos.map((i) => ({ key: crypto.randomUUID(), label: i.label, info: strip(i.info) })) ?? []);
	// svelte-ignore state_referenced_locally
	let photos = $state<Photo[]>(item?.photos.map((p) => ({ key: crypto.randomUUID(), title: p.title, imageUrl: p.imageUrl })) ?? []);
	let saving = $state(false);

	async function submit() {
		if (!title.trim()) return toast.error('Title is required');
		if (!introduction.trim()) return toast.error('Introduction is required');
		saving = true;
		await saveForm({
			apiPath: '/api/madrasahs',
			id: item?.id,
			name: 'Madrasah',
			redirect: '/admin/madrasah',
			payload: {
				title: title.trim(),
				excerpt: excerpt || null,
				introduction: introduction.trim(),
				position: position ? parseInt(position) : undefined,
				infos: infos.filter((i) => i.label.trim() && i.info.trim()).map((i, idx) => ({ id: null, label: i.label.trim(), info: i.info.trim(), position: idx + 1 })),
				photos: photos.filter((p) => p.imageUrl.trim()).map((p, idx) => ({ id: null, title: p.title.trim(), imageUrl: p.imageUrl.trim(), position: idx + 1 }))
			}
		});
		saving = false;
	}
</script>

<FormFrame
	backLabel="Back to madrasahs"
	fallback="/admin/madrasah"
	heading={item ? 'Edit Madrasah' : 'Add Madrasah'}
	width="max-w-4xl"
	publicHref={item ? `/madrasah/${item.id}` : undefined}
	{saving}
	submitLabel={item ? 'Update Madrasah' : 'Create Madrasah'}
	onsubmit={submit}
>
	<Card variant="roomy" title="Basic Information">
		<Field label="Title" required><input bind:value={title} placeholder="Madrasah name" maxlength={200} class={inputCls} /></Field>
		<Field label="Excerpt" hint="short description"><textarea bind:value={excerpt} placeholder="Brief summary..." rows="2" maxlength={300} class={textareaCls}></textarea></Field>
		<Field label="Introduction" required><RichEditor bind:value={introduction} placeholder="Full introduction..." /></Field>
		<Field label="Position" class="w-40"><input type="number" min="1" bind:value={position} placeholder="Auto" class={inputCls} /></Field>
	</Card>

	<Card variant="roomy">
		<div class="flex items-center justify-between">
			<h2 class={sectionTitleCls}>Info Fields</h2>
			<Button variant="outline" size="sm" class="gap-1.5 h-8" onclick={() => infos.push({ key: crypto.randomUUID(), label: '', info: '' })}
				><Plus class="w-3.5 h-3.5" /> Add field</Button
			>
		</div>
		{#if infos.length === 0}<p class="text-sm text-muted-foreground text-center py-4">No info fields yet. Add key-value facts about this madrasah.</p>{/if}
		{#each infos as info, idx (info.key)}
			<div class="flex gap-2 items-start">
				<GripVertical class="w-4 h-4 text-muted-foreground/40 mt-2.5 shrink-0" />
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
					<input bind:value={info.label} placeholder="Label {idx + 1} (e.g. Founded)" maxlength={100} class={inputCls} />
					<input bind:value={info.info} placeholder="Value" maxlength={300} class={inputCls} />
				</div>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Remove"
					class="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
					onclick={() => (infos = infos.filter((i) => i.key !== info.key))}><Trash2 class="w-4 h-4" /></Button
				>
			</div>
		{/each}
	</Card>

	<Card variant="roomy">
		<div class="flex items-center justify-between">
			<h2 class={sectionTitleCls}>Photos</h2>
			<Button variant="outline" size="sm" class="gap-1.5 h-8" onclick={() => photos.push({ key: crypto.randomUUID(), title: '', imageUrl: '' })}
				><Plus class="w-3.5 h-3.5" /> Add photo</Button
			>
		</div>
		{#if photos.length === 0}<p class="text-sm text-muted-foreground text-center py-4">No photos yet.</p>{/if}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{#each photos as photo (photo.key)}
				<div class="bg-muted/20 border rounded-xl p-3 space-y-2">
					<div class="flex items-center justify-between gap-2">
						<input bind:value={photo.title} placeholder="Photo caption" maxlength={200} class={inp('text-sm')} />
						<Button
							variant="ghost"
							size="icon"
							aria-label="Remove"
							class="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
							onclick={() => (photos = photos.filter((p) => p.key !== photo.key))}><Trash2 class="w-3.5 h-3.5" /></Button
						>
					</div>
					<MediaField accept="image" bind:value={photo.imageUrl} placeholder="Select photo" compact />
				</div>
			{/each}
		</div>
	</Card>
</FormFrame>
