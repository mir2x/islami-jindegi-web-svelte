<script lang="ts">
	import type { PageListItem } from '#lib/types.ts';
	import SimpleList from '../list/SimpleList.svelte';
	import Badge from '../ui/Badge.svelte';
</script>

<SimpleList
	title="Pages"
	unit="static pages"
	singular="page"
	plural="pages"
	apiPath="/api/pages"
	slug="pages"
	addLabel="Add Page"
	icon="file"
	emptyHint="Add your first static page"
	searchPlaceholder="Search pages..."
	offline
	nameOf={(p: PageListItem) => p.title}
	columns={[
		{ label: 'Title', cell: title, skeleton: 'h-4 w-56' },
		{ label: 'Slug', cell: slug, skeleton: 'h-5 w-24 rounded-full' },
		{ label: 'Updated', cell: updated, skeleton: 'h-3.5 w-24' }
	]}
/>

{#snippet title(p: PageListItem)}<p class="font-semibold leading-snug">{p.title}</p>{/snippet}
{#snippet slug(p: PageListItem)}<Badge class="text-xs font-mono">{p.slug}</Badge>{/snippet}
{#snippet updated(p: PageListItem)}<span class="text-sm text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</span>{/snippet}
