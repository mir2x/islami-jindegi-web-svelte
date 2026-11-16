<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Send from '@lucide/svelte/icons/send';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { api, ApiError } from '../api.ts';
	import { goBack } from '../navigate.ts';
	import { toast } from '../toast.svelte.ts';
	import Badge from '../ui/Badge.svelte';
	import Button from '../ui/Button.svelte';
	import { inp } from '../ui/classes.ts';
	import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import { type Question, when } from './types.ts';

	let { question: initial }: { question: Question } = $props();

	// svelte-ignore state_referenced_locally
	let q = $state<Question>(initial);
	let answer = $state('');
	let sending = $state(false);
	let error = $state('');
	let deleting = $state(false);
	let busy = $state(false);

	// What the last failed attempt said, until the next try replaces it.
	const problem = $derived(error || q.mailError || '');

	async function send() {
		if (!answer.trim() || sending) return;
		sending = true;
		error = '';
		try {
			q = await api.post<Question>(`/api/questions/${q.id}/answer`, { answer: answer.trim() });
			toast.success(`Answer emailed to ${q.email}`);
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'The answer could not be sent.';
			toast.error('The answer was not sent');
		} finally {
			sending = false;
		}
	}

	async function remove() {
		busy = true;
		try {
			await api.delete(`/api/questions/${q.id}`);
			toast.success('Question deleted');
			goBack('/admin/questions');
		} catch {
			toast.error('Failed to delete the question');
			busy = false;
			deleting = false;
		}
	}
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
	<div class="flex items-center justify-between gap-3">
		<Button variant="ghost" class="gap-2 -ms-3" onclick={() => goBack('/admin/questions')}><ArrowLeft class="w-4 h-4" /> Questions</Button>
		<Button variant="ghost" class="gap-2 text-muted-foreground hover:text-destructive" onclick={() => (deleting = true)}><Trash2 class="w-4 h-4" /> Delete</Button>
	</div>

	<section class="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
		<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
			<a class="font-semibold text-foreground hover:underline" href="mailto:{q.email}">{q.email}</a>
			<span>{when(q.createdAt)}</span>
			<span>{q.locale === 'en' ? 'English' : 'বাংলা'}</span>
			<Badge variant={q.status === 'answered' ? 'secondary' : 'default'}>{q.status === 'answered' ? 'Answered' : 'Waiting'}</Badge>
		</div>
		<p class="text-base leading-relaxed whitespace-pre-wrap break-words">{q.question}</p>
	</section>

	{#if q.status === 'answered'}
		<section class="rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-3">
			<p class="text-sm text-muted-foreground">Emailed {q.answeredAt ? when(q.answeredAt) : ''}{q.answeredBy ? ` by ${q.answeredBy}` : ''}</p>
			<p class="text-base leading-relaxed whitespace-pre-wrap break-words">{q.answer}</p>
		</section>
	{:else}
		<section class="space-y-3">
			<label class="block">
				<span class="block mb-1.5 text-sm font-semibold">Your answer</span>
				<textarea
					bind:value={answer}
					rows="10"
					maxlength="8000"
					class={inp('bg-card resize-y h-64 py-3 leading-relaxed')}
					placeholder="Write the answer. It is emailed to {q.email} exactly as written, below a short greeting and a copy of the question."></textarea>
			</label>
			{#if problem}
				<p class="rounded-lg border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive" role="alert">The last attempt to send failed: {problem}</p>
			{/if}
			<div class="flex items-center gap-3">
				<Button onclick={send} disabled={sending || !answer.trim()} class="gap-2"><Send class="w-4 h-4" /> {sending ? 'Sending…' : 'Send answer by email'}</Button>
				<span class="text-xs text-muted-foreground">It is marked answered only once the mail server accepts it.</span>
			</div>
		</section>
	{/if}

	<ConfirmDialog open={deleting} title="Delete this question?" {busy} onconfirm={remove} oncancel={() => (deleting = false)}>
		The question from <strong>{q.email}</strong> is removed for good. Nothing is sent to them.
	</ConfirmDialog>
</div>
