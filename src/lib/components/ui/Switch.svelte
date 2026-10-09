<script lang="ts">
	import { cn } from '#lib/utils.ts';

	let { checked, label, onchange }: { checked: boolean; label: string; onchange: (value: boolean) => void } = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	onclick={() => onchange(!checked)}
	class={cn('relative w-10 h-5 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-muted')}
>
	<span class={cn('absolute left-0 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')}></span>
</button>
