<script lang="ts">
	import type { MadrasahListItem } from '#lib/types.ts';
	import SimpleList from '../list/SimpleList.svelte';
</script>

<SimpleList
	title="Madrasah"
	unit="entries"
	singular="madrasah"
	plural="madrasahs"
	apiPath="/api/madrasahs"
	slug="madrasah"
	addLabel="Add Madrasah"
	icon="school"
	emptyHint="Add your first madrasah"
	searchPlaceholder="Search madrasahs..."
	offline
	deleteNote="and all its info fields and photos will be permanently deleted."
	nameOf={(m: MadrasahListItem) => m.title}
	columns={[
		{ label: 'Pos.', width: 'w-16', cell: pos, skeleton: 'h-3.5 w-6' },
		{ label: 'Title', cell: title, skeleton: 'h-4 w-56' },
		{ label: 'Info Fields', width: 'w-28', cell: infos, skeleton: 'h-3.5 w-8' },
		{ label: 'Photos', width: 'w-24', cell: photos, skeleton: 'h-3.5 w-8' }
	]}
/>

{#snippet pos(m: MadrasahListItem)}<span class="text-sm text-muted-foreground">{m.position}</span>{/snippet}
{#snippet title(m: MadrasahListItem)}
	<p class="font-semibold leading-snug">{m.title}</p>
	{#if m.excerpt}<p class="text-sm text-muted-foreground line-clamp-1 mt-0.5">{m.excerpt}</p>{/if}
{/snippet}
{#snippet infos(m: MadrasahListItem)}<span class="text-sm text-muted-foreground">{m.infoCount}</span>{/snippet}
{#snippet photos(m: MadrasahListItem)}<span class="text-sm text-muted-foreground">{m.photoCount}</span>{/snippet}
