<script lang="ts">
	import type { NamazTimeListItem } from '#lib/types.ts';
	import SimpleList from '../list/SimpleList.svelte';
</script>

<SimpleList
	title="Namaz Times"
	unit="entries"
	singular="namaz time"
	plural="namaz times"
	apiPath="/api/namaz-times"
	slug="namaz-times"
	addLabel="Add Namaz Time"
	icon="clock"
	emptyHint="Add your first entry"
	searchPlaceholder="Search..."
	minWidth="min-w-[560px]"
	nameOf={(n: NamazTimeListItem) => n.title}
	columns={[
		{ label: 'Pos.', width: 'w-16', cell: pos, skeleton: 'h-3.5 w-6' },
		{ label: 'Title', cell: title, skeleton: 'h-4 w-32' },
		{ label: 'Bangla Title', cell: bn, skeleton: 'h-4 w-24' }
	]}
/>

{#snippet pos(n: NamazTimeListItem)}<span class="text-sm text-muted-foreground">{n.position}</span>{/snippet}
{#snippet title(n: NamazTimeListItem)}<p class="font-semibold leading-snug">{n.title}</p>{/snippet}
{#snippet bn(n: NamazTimeListItem)}<span class="text-sm text-muted-foreground">{n.titleBn ?? '—'}</span>{/snippet}
