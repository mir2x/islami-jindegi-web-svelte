<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		checked: boolean;
		children: Snippet;
		disabled?: boolean;
	}
	let { checked = $bindable(), children, disabled }: Props = $props();
</script>

<label class="flex items-center gap-2.5 text-sm font-medium cursor-pointer select-none">
	<input type="checkbox" bind:checked {disabled} class="size-4 rounded-[4px] accent-primary cursor-pointer" />
	{@render children()}
</label>
