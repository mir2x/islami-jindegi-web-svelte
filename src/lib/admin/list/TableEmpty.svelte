<script lang="ts">
	import EmptyIcon from '../ui/EmptyIcon.svelte';
	import type { EmptyIconName } from '../ui/icons.ts';

	let { colspan, icon, title, hint }: { colspan: number; icon: EmptyIconName; title: string; hint: string } = $props();
</script>

<tr>
	<td {colspan} class="px-5 py-20 text-center">
		<EmptyIcon name={icon} />
		<p class="font-medium">{title}</p>
		<p class="text-sm text-muted-foreground mt-1">{hint}</p>
	</td>
</tr>
