<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Search from '@lucide/svelte/icons/search';
	import { onMount } from 'svelte';
	import { localePath } from '#lib/i18n/use-t.svelte.ts';
	import type { AuthorBrowseAdminItem, AuthorBrowseAdminResponse } from '#lib/types.ts';
	import { cn } from '#lib/utils.ts';
	import { ApiError, api } from '../api.ts';
	import { toast } from '../toast.svelte.ts';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import Card from '../ui/Card.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import Select from '../ui/Select.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import EditAuthorDialog from './EditAuthorDialog.svelte';
	import GroupsPanel from './GroupsPanel.svelte';
	import OrderPanel from './OrderPanel.svelte';
	import { ALL, UNGROUPED, countsLine } from './author-browse-helpers.ts';

	let data = $state<AuthorBrowseAdminResponse | null>(null);
	let filter = $state(ALL);
	let search = $state('');
	let editing = $state<AuthorBrowseAdminItem | null>(null);

	async function refresh() {
		try {
			data = await api.get<AuthorBrowseAdminResponse>('/api/authors/browse/admin');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'Could not load authors');
		}
	}
	onMount(() => void refresh());

	const groups = $derived(data?.groups ?? []);
	const groupTitle = $derived(new Map(groups.map((g) => [g.id, g.title])));
	// A group that was deleted elsewhere falls back to showing everything.
	const active = $derived(filter === ALL || filter === UNGROUPED || groupTitle.has(filter) ? filter : ALL);
	const inGroup = $derived((data?.authors ?? []).filter((t) => active === ALL || (t.groupId ?? UNGROUPED) === active));
	const rows = $derived.by(() => {
		const q = search.trim();
		return q ? inGroup.filter((t) => t.name.includes(q) || t.slug?.includes(q)) : inGroup;
	});
</script>

<div class="max-w-6xl mx-auto p-4 sm:p-5 space-y-5">
	<div>
		<h1 class="text-2xl font-bold">Author pages (লেখক/বক্তা)</h1>
		<p class="text-sm text-muted-foreground mt-1">
			Every author or speaker with published content gets a page on the public site. Here you can group, order, hide and describe them. The authors themselves are not changed.
		</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
		<div class="lg:col-span-2 space-y-5">
			<Card>
				<div class="flex flex-col sm:flex-row gap-3">
					<div class="relative flex-1">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input bind:value={search} placeholder="Search authors" class={inp('pl-9')} />
					</div>
					<Select
						class="sm:w-56"
						bind:value={filter}
						options={[{ value: ALL, label: 'All authors' }, { value: UNGROUPED, label: 'No group' }, ...groups.map((g) => ({ value: g.id, label: g.title }))]}
					/>
				</div>

				{#if !data}
					<div class="space-y-2">
						{#each { length: 8 } as _, i (i)}<Skeleton class="h-12 w-full" />{/each}
					</div>
				{:else if rows.length === 0}
					<p class="text-sm text-muted-foreground py-8 text-center">No authors match.</p>
				{:else}
					<ul class="divide-y">
						{#each rows as t (t.authorId)}
							<li class="flex items-center gap-3 py-3">
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 flex-wrap">
										<span class={cn('font-medium truncate', (t.hidden || t.total === 0) && 'text-muted-foreground')}>{t.name}</span>
										{#if t.hidden}<Badge>Hidden</Badge>{/if}
										{#if t.total === 0}<Badge>No published content</Badge>{/if}
										{#if active === ALL && t.groupId}<Badge variant="secondary">{groupTitle.get(t.groupId)}</Badge>{/if}
									</div>
									<p class="text-xs text-muted-foreground mt-1 truncate">
										{countsLine(t) || '—'}{#if t.slug}
											· /authors/{t.slug}{/if}
									</p>
								</div>
								{#if !t.hidden && t.total > 0}
									<a
										href={localePath(`/authors/${encodeURIComponent(t.slug ?? t.authorId)}`)}
										target="_blank"
										rel="noopener noreferrer"
										class="text-muted-foreground hover:text-primary shrink-0"
										aria-label="Open public page"><ExternalLink class="w-4 h-4" /></a
									>
								{/if}
								<Button variant="outline" size="sm" onclick={() => (editing = t)}><Pencil class="w-3.5 h-3.5" /> Edit</Button>
							</li>
						{/each}
					</ul>
				{/if}
			</Card>

			{#if active !== ALL && data}
				{#key active}<OrderPanel groupKey={active} authors={inGroup} onchanged={refresh} />{/key}
			{:else if active === ALL}
				<p class="text-sm text-muted-foreground">To change the order, pick a group (or “No group”) above.</p>
			{/if}
		</div>

		<GroupsPanel {groups} onchanged={refresh} />
	</div>

	{#if editing}{#key editing.authorId}<EditAuthorDialog author={editing} {groups} onclose={() => (editing = null)} onsaved={refresh} />{/key}{/if}
</div>
