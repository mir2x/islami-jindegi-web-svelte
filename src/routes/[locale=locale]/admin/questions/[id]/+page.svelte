<script lang="ts">
	import { page } from '$app/state';
	import { api } from '#lib/admin/api.ts';
	import QuestionPage from '#lib/admin/questions/QuestionPage.svelte';
	import type { Question } from '#lib/admin/questions/types.ts';
	import LoadItem from '#lib/admin/ui/LoadItem.svelte';
</script>

<LoadItem load={() => api.get<Question>(`/api/questions/${page.params.id}`)} notFound="Question not found.">
	{#snippet children(question)}<QuestionPage {question} />{/snippet}
</LoadItem>
