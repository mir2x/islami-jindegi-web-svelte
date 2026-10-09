<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { onMount } from 'svelte';
	import type { Admin } from '#lib/types.ts';
	import { api } from '../api.ts';
	import { auth } from '../auth.svelte.ts';
	import DataTable from '../list/DataTable.svelte';
	import TableEmpty from '../list/TableEmpty.svelte';
	import { toast } from '../toast.svelte.ts';
	import Button from '../ui/Button.svelte';
	import { inputCls, inp } from '../ui/classes.ts';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import Skeleton from '../ui/Skeleton.svelte';

	let admins = $state<Admin[] | null>(null);
	let email = $state('');
	let adding = $state(false);
	let deleting = $state<Admin | null>(null);
	let busy = $state(false);

	const load = async () => (admins = await api.get<Admin[]>('/api/admins'));
	onMount(() => void load().catch(() => toast.error('Failed to load admins')));

	async function add() {
		const trimmed = email.trim();
		if (!trimmed) return;
		adding = true;
		try {
			await api.post('/api/admins', { email: trimmed });
			toast.success('Admin added');
			email = '';
			await load();
		} catch {
			toast.error('Failed to add admin');
		} finally {
			adding = false;
		}
	}

	async function remove() {
		if (!deleting) return;
		busy = true;
		try {
			await api.delete(`/api/admins/${deleting.id}`);
			toast.success('Admin removed');
			deleting = null;
			await load();
		} catch {
			toast.error('Failed to remove admin');
		} finally {
			busy = false;
		}
	}
</script>

<div class="min-h-full flex flex-col">
	<div class="shrink-0 px-4 sm:px-8 pt-8 pb-4 bg-background">
		<div class="mb-6">
			<h1 class="text-2xl font-bold tracking-tight">Admins</h1>
			<p class="mt-1 text-sm text-muted-foreground">Gmail accounts allowed to sign in to this dashboard.</p>
		</div>
		<div class="flex gap-2 max-w-md">
			<input placeholder="name@gmail.com" bind:value={email} onkeydown={(e) => e.key === 'Enter' && add()} class={inp('bg-card')} />
			<Button onclick={add} disabled={adding || !email.trim()} class="gap-2 shrink-0"><Plus class="w-4 h-4" /> Add</Button>
		</div>
	</div>

	<div class="flex-1 px-4 sm:px-8 pb-4">
		<DataTable widths={['', 'w-40', 'w-16']} minWidth="min-w-[480px]">
			{#snippet head()}
				<th class="px-5 py-3.5 text-left text-sm font-semibold text-muted-foreground">Email</th>
				<th class="px-5 py-3.5 text-left text-sm font-semibold text-muted-foreground">Added</th>
				<th class="px-5 py-3.5"></th>
			{/snippet}
			{#if !admins}
				{#each { length: 4 } as _, i (i)}
					<tr
						><td class="px-5 py-4"><Skeleton class="h-4 w-48" /></td><td class="px-5 py-4"><Skeleton class="h-3.5 w-20" /></td><td class="px-5 py-4"
							><Skeleton class="h-8 w-8" /></td
						></tr
					>
				{/each}
			{:else if admins.length === 0}
				<TableEmpty colspan={3} icon="shield" title="No admins found" hint="" />
			{:else}
				{#each admins as admin (admin.id)}
					{@const self = admin.email === auth.email}
					<tr class="hover:bg-muted/30 transition-colors group">
						<td class="px-5 py-4">
							<p class="font-semibold truncate">{admin.email}</p>
							{#if self}<p class="text-xs text-muted-foreground mt-0.5">You</p>{/if}
						</td>
						<td class="px-5 py-4 text-sm text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString()}</td>
						<td class="px-5 py-4">
							<div class="flex items-center justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
								<Button
									variant="ghost"
									size="icon"
									disabled={self}
									aria-label="Remove admin"
									title={self ? "You can't remove your own access" : 'Remove admin'}
									onclick={() => (deleting = admin)}
									class="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 class="w-3.5 h-3.5" /></Button
								>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</DataTable>
	</div>

	<ConfirmDialog open={!!deleting} title="Remove admin?" {busy} confirmLabel="Remove" busyLabel="Removing..." onconfirm={remove} oncancel={() => (deleting = null)}>
		<strong>{deleting?.email}</strong> will no longer be able to sign in to this dashboard.
	</ConfirmDialog>
</div>
