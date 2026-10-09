<script lang="ts">
	import type { NamazTimeDetail } from '#lib/types.ts';
	import RichEditor from '../editor/RichEditor.svelte';
	import { toast } from '../toast.svelte.ts';
	import Card from '../ui/Card.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import FormFrame from '../ui/FormFrame.svelte';
	import { saveForm } from '../ui/save.ts';

	let { item = null }: { item?: NamazTimeDetail | null } = $props();

	// svelte-ignore state_referenced_locally
	let title = $state(item?.title ?? '');
	// svelte-ignore state_referenced_locally
	let titleBn = $state(item?.titleBn ?? '');
	// svelte-ignore state_referenced_locally
	let masail = $state(item?.masail ?? '');
	// svelte-ignore state_referenced_locally
	let fazail = $state(item?.fazail ?? '');
	// svelte-ignore state_referenced_locally
	let position = $state(item ? String(item.position) : '');
	let saving = $state(false);

	async function submit() {
		if (!title.trim()) return toast.error('Title is required');
		if (!masail.trim()) return toast.error('Masail is required');
		saving = true;
		await saveForm({
			apiPath: '/api/namaz-times',
			id: item?.id,
			name: 'Namaz time',
			redirect: '/admin/namaz-times',
			payload: { title: title.trim(), titleBn: titleBn || null, masail: masail.trim(), fazail: fazail || null, position: position ? parseInt(position) : undefined }
		});
		saving = false;
	}
</script>

<FormFrame
	backLabel="Back to namaz times"
	fallback="/admin/namaz-times"
	heading={item ? 'Edit Namaz Time' : 'Add Namaz Time'}
	{saving}
	submitLabel={item ? 'Update' : 'Create'}
	onsubmit={submit}
>
	<Card variant="roomy" title="Basic Information">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Field label="Title (English)" required><input bind:value={title} placeholder="e.g. Fajr" maxlength={100} class={inputCls} /></Field>
			<Field label="Title (Bangla)"><input bind:value={titleBn} placeholder="e.g. ফজর" maxlength={100} class={inputCls} /></Field>
		</div>
		<Field label="Position"><input type="number" min="1" bind:value={position} placeholder="Auto" class={inp('w-40')} /></Field>
	</Card>
	<Card variant="roomy" title="Content">
		<Field label="Masail" hint="legal rulings" required><RichEditor bind:value={masail} placeholder="Write masail content..." /></Field>
		<Field label="Fazail" hint="virtues"><RichEditor bind:value={fazail} placeholder="Write fazail content..." /></Field>
	</Card>
</FormFrame>
