<script lang="ts">
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import type { CategoryModuleMembership } from '#lib/types.ts';
	import Card from '../ui/Card.svelte';

	interface Props {
		modules: readonly { key: string; label: string }[];
		selected: string[];
		/** Current per-module positions of the record being edited. */
		memberships?: CategoryModuleMembership[];
		noun: string;
		reorderHref: string;
	}
	let { modules, selected = $bindable(), memberships = [], noun, reorderHref }: Props = $props();

	const positionIn = (key: string) => memberships.find((m) => m.module === key)?.position;
	function toggle(key: string, on: boolean) {
		selected = on ? [...selected, key] : selected.filter((m) => m !== key);
	}
</script>

<Card title="Appears in" class="space-y-3">
	<p class="text-xs text-muted-foreground -mt-2">
		A new {noun} is added to the end of each list.
		<a href={localePath(selected.length ? `${reorderHref}?module=${selected[0]}` : reorderHref)} class="underline underline-offset-2 hover:text-foreground">Reorder</a>
		to arrange {noun === 'author' ? 'them' : 'it'}.
	</p>
	<div class="grid grid-cols-2 gap-x-4 gap-y-2.5">
		{#each modules as m (m.key)}
			{@const checked = selected.includes(m.key)}
			{@const pos = positionIn(m.key)}
			<label class="flex items-center gap-2.5 cursor-pointer select-none">
				<input type="checkbox" {checked} onchange={(e) => toggle(m.key, e.currentTarget.checked)} class="size-4 rounded-[4px] accent-primary cursor-pointer" />
				<span class="text-sm">{m.label}</span>
				{#if checked && pos !== undefined}<span class="text-xs text-muted-foreground">#{pos}</span>{/if}
			</label>
		{/each}
	</div>
</Card>
