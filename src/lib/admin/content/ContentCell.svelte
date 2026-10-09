<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Switch from '#lib/components/ui/Switch.svelte';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import StatusPill from '../ui/StatusPill.svelte';
	import { toast } from '../toast.svelte.ts';
	import type { CellKind } from './types.ts';

	interface Props {
		kind: CellKind;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		item: Record<string, any>;
		copyId?: boolean;
		onoffline: (value: boolean) => void;
	}
	let { kind, item, copyId, onoffline }: Props = $props();

	async function copy() {
		try {
			await navigator.clipboard.writeText(item.id);
			toast.success('GUID copied');
		} catch {
			toast.error('Failed to copy GUID');
		}
	}

	const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

{#if kind === 'position'}
	<span class="text-sm font-mono text-muted-foreground">{item.position ?? '—'}</span>
{:else if kind === 'title'}
	<div class="flex items-center gap-1.5 min-w-0">
		<p class="font-semibold leading-snug truncate">{item.title}</p>
		{#if copyId}<Button
				variant="ghost"
				size="icon"
				aria-label="Copy GUID"
				title="Copy GUID"
				onclick={(e) => {
					e.stopPropagation();
					copy();
				}}
				class="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"><Copy class="w-3.5 h-3.5" /></Button
			>{/if}
	</div>
	{#if item.excerpt}<p class="text-sm text-muted-foreground line-clamp-1 mt-0.5">{item.excerpt}</p>{/if}
{:else if kind === 'author'}
	<p class="text-sm text-muted-foreground line-clamp-2">{item.author?.name ?? '—'}</p>
{:else if kind === 'categories'}
	<div class="flex flex-wrap gap-1">
		{#each item.categories.slice(0, 2) as c (c.id)}<Badge class="text-xs">{c.title}</Badge>{/each}
		{#if item.categories.length > 2}<span class="text-xs text-muted-foreground">+{item.categories.length - 2}</span>{/if}
		{#if item.categories.length === 0}<span class="text-xs text-muted-foreground">—</span>{/if}
	</div>
{:else if kind === 'language'}
	<Badge class="text-xs">{item.language}</Badge>
{:else if kind === 'location'}
	<p class="text-sm text-muted-foreground line-clamp-2">{item.location ?? '—'}</p>
{:else if kind === 'date'}
	<span class="text-sm text-muted-foreground whitespace-nowrap">{shortDate(item.publishedAt)}</span>
{:else if kind === 'longDate'}
	<span class="text-sm text-muted-foreground whitespace-nowrap">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '—'}</span>
{:else if kind === 'status'}
	<StatusPill published={item.published} />
{:else if kind === 'audio'}
	{#if item.hasAudio}<span class="inline-flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">Audio</span
		>{:else}<span class="text-muted-foreground/40 text-xs">—</span>{/if}
{:else if kind === 'offline'}
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
	<div onclick={(e) => e.stopPropagation()}><Switch checked={item.isOfflineAvailable} label="Available offline" onchange={onoffline} /></div>
{/if}
