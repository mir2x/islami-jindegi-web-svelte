<script lang="ts">
	import { onMount } from 'svelte';
	import { CONTENT_MODULES } from '#lib/modules.ts';
	import { api } from '../api.ts';
	import { lookups } from '../lookups.svelte.ts';
	import ReorderScreen from './ReorderScreen.svelte';

	let loading = $state(true);
	onMount(() => void lookups.ensureCategories().finally(() => (loading = false)));

	const positionIn = (c: (typeof lookups.categories)[number], module: string) => c.modules?.find((m) => m.module === module)?.position ?? 0;
</script>

<ReorderScreen
	heading="Reorder Categories"
	listHref="/admin/categories"
	noun="categories"
	modules={CONTENT_MODULES}
	{loading}
	itemsFor={(module) =>
		lookups.categories
			.filter((c) => c.modules?.some((m) => m.module === module))
			.map((c) => ({ id: c.id, label: c.title, position: positionIn(c, module) }))
			.sort((a, b) => a.position - b.position)}
	save={async (module, ids) => {
		await api.put('/api/categories/reorder', { module, categoryIds: ids });
		lookups.invalidate('categories');
		await lookups.ensureCategories();
	}}
/>
