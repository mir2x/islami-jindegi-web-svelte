<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import Badge from './Badge.svelte';
	import Combobox, { type ComboOption } from './Combobox.svelte';

	interface Props {
		options: ComboOption[];
		/** Selected ids. */
		value: string[];
		placeholder: string;
		searchPlaceholder: string;
		emptyText: string;
		/** Trigger text for a non-empty selection; defaults to "N selected". */
		selectedText?: (count: number) => string;
		/** Label for a selected id the options do not (yet) contain, e.g. before they load. */
		fallbackLabel?: (id: string) => string | undefined;
	}
	let { options, value = $bindable(), placeholder, searchPlaceholder, emptyText, selectedText, fallbackLabel }: Props = $props();

	const labelOf = (id: string) => options.find((o) => o.id === id)?.label ?? fallbackLabel?.(id) ?? '…';
</script>

<Combobox {options} bind:value multiple triggerClass="bg-background" {placeholder} {searchPlaceholder} {emptyText} {selectedText} />
{#if value.length > 0}
	<div class="flex flex-wrap gap-1.5 mt-2">
		{#each value as id (id)}
			<Badge variant="secondary" class="gap-1 pr-1">
				{labelOf(id)}
				<button type="button" aria-label="Remove" onclick={() => (value = value.filter((x) => x !== id))} class="rounded-full hover:bg-black/10 p-0.5"><X class="w-3 h-3" /></button
				>
			</Badge>
		{/each}
	</div>
{/if}
