<script lang="ts">
	import { api } from '../api.ts';
	import DataTable from '../list/DataTable.svelte';
	import TableEmpty from '../list/TableEmpty.svelte';
	import { adminNavigate } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import Badge from '../ui/Badge.svelte';
	import Pagination from '../ui/Pagination.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import Tabs from '../ui/Tabs.svelte';
	import { PAGE_SIZE, type QuestionPage, when } from './types.ts';

	const TABS = [
		{ id: 'open', label: 'Waiting for an answer' },
		{ id: 'answered', label: 'Answered' },
		{ id: 'all', label: 'All' }
	] as const;

	let status = $state<string>('open');
	let page = $state(1);
	let result = $state<QuestionPage | null>(null);

	$effect(() => {
		const [s, p] = [status, page];
		let stale = false;
		result = null;
		api
			.get<QuestionPage>(`/api/questions?status=${s}&page=${p}&pageSize=${PAGE_SIZE}`)
			.then((r) => !stale && (result = r))
			.catch(() => {
				if (!stale) toast.error('Failed to load questions');
			});
		return () => (stale = true);
	});

	const pages = $derived(Math.max(1, Math.ceil((result?.total ?? 0) / PAGE_SIZE)));
	const th = 'px-5 py-3.5 text-left text-sm font-semibold text-muted-foreground';
</script>

<div class="min-h-full flex flex-col">
	<div class="shrink-0 px-4 sm:px-8 pt-8 pb-4 bg-background space-y-5">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Questions</h1>
			<p class="mt-1 text-sm text-muted-foreground">Questions visitors sent from the website. Open one to write the answer; it is emailed to them.</p>
		</div>
		<Tabs
			tabs={TABS}
			value={status}
			onchange={(id) => {
				status = id;
				page = 1;
			}}
		/>
	</div>

	<div class="flex-1 px-4 sm:px-8 pb-4">
		<DataTable widths={['', 'w-64', 'w-44', 'w-36']} minWidth="min-w-[760px]">
			{#snippet head()}
				<th class={th}>Question</th>
				<th class={th}>From</th>
				<th class={th}>Received</th>
				<th class={th}>Status</th>
			{/snippet}
			{#if !result}
				{#each { length: 5 } as _, i (i)}
					<tr>
						<td class="px-5 py-4"><Skeleton class="h-4 w-full max-w-md" /></td>
						<td class="px-5 py-4"><Skeleton class="h-4 w-40" /></td>
						<td class="px-5 py-4"><Skeleton class="h-4 w-28" /></td>
						<td class="px-5 py-4"><Skeleton class="h-5 w-20" /></td>
					</tr>
				{/each}
			{:else if result.data.length === 0}
				<TableEmpty colspan={4} icon="help" title={status === 'open' ? 'No questions are waiting' : 'No questions here'} hint="" />
			{:else}
				{#each result.data as q (q.id)}
					<tr class="hover:bg-muted/30 transition-colors cursor-pointer" onclick={(e) => adminNavigate(`/admin/questions/${q.id}`, e)}>
						<td class="px-5 py-4"><p class="line-clamp-2 font-medium">{q.question}</p></td>
						<td class="px-5 py-4 text-sm text-muted-foreground truncate">{q.email}</td>
						<td class="px-5 py-4 text-sm text-muted-foreground">{when(q.createdAt)}</td>
						<td class="px-5 py-4"><Badge variant={q.status === 'answered' ? 'secondary' : 'default'}>{q.status === 'answered' ? 'Answered' : 'Waiting'}</Badge></td>
					</tr>
				{/each}
			{/if}
		</DataTable>
		{#if result && pages > 1}<div class="mt-4 flex justify-center"><Pagination {page} totalPages={pages} onchange={(p) => (page = p)} /></div>{/if}
	</div>
</div>
