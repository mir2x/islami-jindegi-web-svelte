<script lang="ts">
	import { api } from '../api.ts';
	import LoadItem from '../ui/LoadItem.svelte';
	import ContentForm from './ContentForm.svelte';
	import SideList from './SideList.svelte';
	import type { ContentConfig } from './types.ts';

	let { config, id }: { config: ContentConfig; id: string } = $props();
</script>

<div class="flex h-full">
	<SideList {config} currentId={id} />
	<div class="flex-1 overflow-y-auto">
		<!-- Keyed by the loaded record inside LoadItem: the form seeds its values from it, so a different record is a fresh form. -->
		<LoadItem load={() => api.get<Record<string, any> & { id: string }>(config.detail(id))} width="max-w-none">
			{#snippet children(item)}<ContentForm {config} {item} />{/snippet}
		</LoadItem>
	</div>
</div>
