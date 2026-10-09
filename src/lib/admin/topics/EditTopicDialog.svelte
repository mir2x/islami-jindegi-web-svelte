<script lang="ts">
	import Save from '@lucide/svelte/icons/save';
	import Switch from '#lib/components/ui/Switch.svelte';
	import Modal from '#lib/components/ui/Modal.svelte';
	import type { TopicAdminItem, TopicGroupAdmin } from '#lib/types.ts';
	import { ApiError, api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import { inputCls, textareaCls } from '../ui/classes.ts';
	import Field from '../ui/Field.svelte';
	import Select from '../ui/Select.svelte';
	import { UNGROUPED } from './topic-helpers.ts';

	interface Props {
		topic: TopicAdminItem;
		groups: TopicGroupAdmin[];
		onclose: () => void;
		onsaved: () => Promise<void>;
	}
	let { topic, groups, onclose, onsaved }: Props = $props();

	// The dialog is mounted per topic, so these seed once.
	// svelte-ignore state_referenced_locally
	let slug = $state(topic.slug ?? '');
	// svelte-ignore state_referenced_locally
	let groupId = $state(topic.groupId ?? UNGROUPED);
	// svelte-ignore state_referenced_locally
	let hidden = $state(topic.hidden);
	// svelte-ignore state_referenced_locally
	let icon = $state(topic.icon ?? '');
	// svelte-ignore state_referenced_locally
	let description = $state(topic.description ?? '');
	let saving = $state(false);

	async function save() {
		saving = true;
		try {
			await api.put(`/api/topics/admin/${topic.categoryId}`, {
				slug: slug.trim() || null,
				groupId: groupId === UNGROUPED ? null : groupId,
				hidden,
				icon: icon.trim() || null,
				description: description.trim() || null
			});
			toast.success('Topic saved');
			await onsaved();
			onclose();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Could not save the topic');
		} finally {
			saving = false;
		}
	}
</script>

<Modal open title={topic.title} {onclose} class="max-w-lg">
	<div class="p-4 space-y-4 overflow-y-auto">
		<p class="text-sm text-muted-foreground">These settings only affect the topic pages. The category itself is edited under Categories.</p>
		<Field label="URL slug">
			<input bind:value={slug} placeholder="Generated from the title when empty" class={inputCls} />
			<p class="text-xs text-muted-foreground">/topics/{slug.trim() || '…'}: spaces and punctuation become “-”. Changing it breaks links shared with the old one.</p>
		</Field>
		<Field label="Group"><Select bind:value={groupId} options={[{ value: UNGROUPED, label: 'No group' }, ...groups.map((g) => ({ value: g.id, label: g.title }))]} /></Field>
		<div class="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
			<div>
				<p class="text-sm font-medium">Hidden</p>
				<p class="text-xs text-muted-foreground mt-0.5">Hidden topics are left out of the topic pages. Their content is unaffected.</p>
			</div>
			<Switch checked={hidden} label="Hidden" onchange={(v) => (hidden = v)} />
		</div>
		<Field label="Icon key"><input bind:value={icon} placeholder="Optional" class={inputCls} /></Field>
		<Field label="Description"><textarea rows="3" bind:value={description} placeholder="Optional: shown under the title on the topic page" class={textareaCls}></textarea></Field>
	</div>
	<div class="flex justify-end gap-2 border-t border-border bg-muted/50 p-3 rounded-b-2xl">
		<Button variant="outline" onclick={onclose}>Cancel</Button>
		<Button onclick={save} disabled={saving}><Save class="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</Button>
	</div>
</Modal>
