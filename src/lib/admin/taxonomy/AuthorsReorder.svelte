<script lang="ts">
	import { onMount } from 'svelte';
	import { AUTHOR_MODULES } from '#lib/modules.ts';
	import { api } from '../api.ts';
	import { lookups } from '../lookups.svelte.ts';
	import ReorderScreen from './ReorderScreen.svelte';

	let loading = $state(true);
	onMount(() => void lookups.ensureAuthors().finally(() => (loading = false)));

	const positionIn = (a: (typeof lookups.authors)[number], module: string) => a.modules?.find((m) => m.module === module)?.position ?? 0;
</script>

<ReorderScreen
	heading="Reorder Authors"
	listHref="/admin/authors"
	noun="authors"
	modules={AUTHOR_MODULES}
	{loading}
	itemsFor={(module) =>
		lookups.authors
			.filter((a) => a.modules?.some((m) => m.module === module))
			.map((a) => ({ id: a.id, label: a.name, position: positionIn(a, module) }))
			.sort((a, b) => a.position - b.position)}
	save={async (module, ids) => {
		await api.put('/api/authors/reorder', { module, authorIds: ids });
		await lookups.ensureAuthors();
	}}
/>
