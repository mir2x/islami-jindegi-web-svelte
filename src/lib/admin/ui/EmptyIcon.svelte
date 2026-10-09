<script lang="ts">
	import { EMPTY_ICONS, type EmptyIconName } from './icons.ts';

	let { name }: { name: EmptyIconName } = $props();
	const Icon = $derived(EMPTY_ICONS[name]);
</script>

<div class="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-4"><Icon class="w-6 h-6 text-muted-foreground/60" /></div>
