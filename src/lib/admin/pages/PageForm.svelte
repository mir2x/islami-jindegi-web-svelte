<script lang="ts">
	import type { PageDetail } from '#lib/types.ts';
	import RichEditor from '../editor/RichEditor.svelte';
	import MediaField from '../media/MediaField.svelte';
	import { toast } from '../toast.svelte.ts';
	import Card from '../ui/Card.svelte';
	import { inputCls } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import FormFrame from '../ui/FormFrame.svelte';
	import { saveForm } from '../ui/save.ts';

	let { page = null }: { page?: PageDetail | null } = $props();

	const slugify = (value: string) =>
		value
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

	// svelte-ignore state_referenced_locally
	let title = $state(page?.title ?? '');
	// svelte-ignore state_referenced_locally
	let slug = $state(page?.slug ?? '');
	// svelte-ignore state_referenced_locally
	let slugTouched = $state(!!page);
	// svelte-ignore state_referenced_locally
	let body = $state(page?.body ?? '');
	// svelte-ignore state_referenced_locally
	let imageUrl = $state(page?.imageUrl ?? '');
	let saving = $state(false);

	async function submit() {
		if (!title.trim()) return toast.error('Title is required');
		if (!slug.trim()) return toast.error('Slug is required');
		if (!body.trim()) return toast.error('Body is required');
		saving = true;
		await saveForm({
			apiPath: '/api/pages',
			id: page?.id,
			name: 'Page',
			redirect: '/admin/pages',
			payload: { title: title.trim(), slug: slug.trim(), body: body.trim(), imageUrl: imageUrl || null },
			failMessage: 'Something went wrong: the slug may already be in use'
		});
		saving = false;
	}
</script>

<FormFrame
	backLabel="Back to pages"
	fallback="/admin/pages"
	heading={page ? 'Edit Page' : 'Add Page'}
	{saving}
	submitLabel={page ? 'Update Page' : 'Create Page'}
	onsubmit={submit}
>
	<Card variant="roomy" title="Content">
		<Field label="Title" required>
			<input
				value={title}
				oninput={(e) => {
					title = e.currentTarget.value;
					if (!slugTouched) slug = slugify(title);
				}}
				placeholder="About Us"
				maxlength={200}
				class={inputCls}
			/>
		</Field>
		<Field label="Slug" required hint="used by the app to look up this page, must be unique">
			<input
				value={slug}
				oninput={(e) => {
					slug = slugify(e.currentTarget.value);
					slugTouched = true;
				}}
				placeholder="about"
				maxlength={100}
				class={inputCls}
			/>
		</Field>
		<Field label="Body" required><RichEditor bind:value={body} placeholder="Page content..." /></Field>
		<Field label="Image"><MediaField accept="image" bind:value={imageUrl} placeholder="No image" compact /></Field>
	</Card>
</FormFrame>
