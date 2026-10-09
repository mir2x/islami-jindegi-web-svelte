<script lang="ts">
	import { onMount } from 'svelte';
	import { lookups } from '../lookups.svelte.ts';
	import Combobox from '../ui/Combobox.svelte';

	interface Props {
		value: string;
		placeholder: string;
		searchPlaceholder: string;
		emptyText: string;
		onchange?: (id: string) => void;
	}
	let { value = $bindable(), placeholder, searchPlaceholder, emptyText, onchange }: Props = $props();

	onMount(() => void lookups.ensureBooks());
	const options = $derived(lookups.books.map((b) => ({ id: b.id, label: b.title })));
</script>

<Combobox triggerClass="bg-background" {options} bind:value {placeholder} {searchPlaceholder} {emptyText} onchange={(v) => onchange?.(v as string)} />
