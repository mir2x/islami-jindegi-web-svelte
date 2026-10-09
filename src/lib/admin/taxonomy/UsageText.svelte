<script lang="ts">
	import { moduleLabel } from '#lib/modules.ts';
	import type { ModuleUsage } from '#lib/types.ts';

	interface Props {
		/** null while the counts are loading. */
		usage: ModuleUsage[] | null;
		loading: string;
		/** Sentence start when there is content, e.g. "Still has". */
		some: string;
		/** Sentence end after the counts. */
		after?: string;
		none: string;
		/** Style the "some" case as a warning. */
		warn?: boolean;
	}
	let { usage, loading, some, after = '', none, warn = false }: Props = $props();
</script>

{#if usage === null}
	<span class="block mt-2 text-xs">{loading}</span>
{:else if usage.length > 0}
	<span class="block mt-2 {warn ? 'text-destructive' : ''}"
		>{some} {usage.map((u) => `${u.items} ${moduleLabel(u.module).toLowerCase()}`).join(', ')}.{after ? ` ${after}` : ''}</span
	>
{:else}
	<span class="block mt-2 text-xs text-muted-foreground">{none}</span>
{/if}
