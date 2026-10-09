<script lang="ts">
	/** A checkbox with a label and a hint line under it. */
	let { checked = $bindable(), label, hint }: { checked: boolean; label: string; hint: string } = $props();
</script>

<label class="flex items-start gap-2.5 cursor-pointer select-none">
	<input type="checkbox" bind:checked class="mt-0.5 size-4 rounded-[4px] accent-primary cursor-pointer" />
	<span>
		<span class="block text-sm font-medium leading-none">{label}</span>
		<span class="block text-xs text-muted-foreground mt-1">{hint}</span>
	</span>
</label>
