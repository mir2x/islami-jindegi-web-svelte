<script lang="ts">
	import { goBack } from '../navigate.ts';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import { ApiError, api } from '../api.ts';
	import { editorTab } from '../editor-tab.svelte.ts';
	import { lookups } from '../lookups.svelte.ts';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import Tabs from '../ui/Tabs.svelte';
	import PublicViewButton from '../ui/PublicViewButton.svelte';
	import FieldView from './FieldView.svelte';
	import { buildPayload, firstError, initialValues } from './form-values.ts';
	import type { ContentConfig } from './types.ts';

	interface Props {
		config: ContentConfig;
		/** The record being edited; omitted for a new one. */
		item?: (Record<string, any> & { id: string }) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
	}
	let { config, item = null }: Props = $props();

	// svelte-ignore state_referenced_locally
	const tab = editorTab(config.tabs.map((t) => t.id));
	// The form is mounted per record (the edit page keys on the id), so values seed once from the item.
	// svelte-ignore state_referenced_locally
	let values = $state(initialValues(config, item));
	let saving = $state(false);
	const active = $derived(config.tabs.find((t) => t.id === tab.current) ?? config.tabs[0]);

	onMount(() => void lookups.ensureAll());

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		const missing = firstError(config, values);
		if (missing) {
			tab.set(missing.tab);
			return toast.error(missing.message);
		}
		saving = true;
		try {
			const payload = buildPayload(config, values);
			if (item) await api.put(`/api/${config.api}/${item.id}`, payload);
			else await api.post(`/api/${config.api}`, payload);
			toast.success(`${config.toastName} ${item ? 'updated' : 'created'}`);
			await goto(localePath(`/admin/${config.slug}`));
		} catch (err) {
			toast.error(err instanceof ApiError && err.status === 409 ? err.message : 'Something went wrong');
		} finally {
			saving = false;
		}
	}
</script>

<div class="w-full p-6 lg:p-8">
	<div class="flex items-center justify-between mb-4">
		<button type="button" onclick={() => goBack(`/admin/${config.slug}`)} class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			><ArrowLeft class="w-4 h-4" /> Back to {config.backLabel}</button
		>
		{#if item}<PublicViewButton href="{config.publicPath}/{item.id}" />{/if}
	</div>

	<form onsubmit={submit}>
		{#if config.tabs.length > 1}<Tabs tabs={config.tabs} value={active.id} onchange={tab.set} class="mb-6" />{/if}

		<div class="space-y-4">
			{#each active.sections as section, i (i)}
				<Card title={section.title} required={section.requiredMark}>
					{#each section.rows as row, j (j)}
						{#if Array.isArray(row)}
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{#each row as f (f.key)}<FieldView {config} field={f} bind:values known={item?.categories} />{/each}
							</div>
						{:else}
							<FieldView {config} field={row} bind:values known={item?.categories} />
						{/if}
					{/each}
				</Card>
			{/each}
		</div>

		<div class="flex gap-3 mt-6">
			<Button type="submit" disabled={saving} class="flex-1 sm:flex-none sm:px-8">{saving ? 'Saving...' : item ? 'Update' : 'Create'}</Button>
			<Button variant="outline" onclick={() => goBack(`/admin/${config.slug}`)}>Cancel</Button>
		</div>
	</form>
</div>
