<script lang="ts">
	import { goto } from '$app/navigation';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import { apiGet } from '#lib/client-api.ts';
	import { currentLocale, localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import type { HadithLocation } from '#lib/types.ts';
	import { hadithHref, toAsciiDigits } from './common.ts';

	/** Resolves a book-level hadith number to its chapter before navigating, so a bad number is reported inline. */
	let { bookSlug }: { bookSlug: string } = $props();
	const t = useT('HadithJump');
	let value = $state('');
	let loading = $state(false);
	let error = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		const number = parseInt(toAsciiDigits(value));
		if (!number || number < 1) return void (error = true);
		loading = true;
		error = false;
		const loc = await apiGet<HadithLocation>(`/api/hadith/books/${encodeURIComponent(bookSlug)}/hadiths/${number}`);
		loading = false;
		if (!loc) return void (error = true);
		void goto(localePath(hadithHref(loc.bookSlug, loc.chapterId, loc.hadithNumber), currentLocale()));
	}
</script>

<form onsubmit={submit}>
	<div class="flex gap-2">
		<input
			inputmode="numeric"
			bind:value
			oninput={() => (error = false)}
			placeholder={t('placeholder')}
			class="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-ring"
		/>
		<button
			type="submit"
			disabled={loading || !value.trim()}
			class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
		>
			{#if loading}<Loader2 class="w-4 h-4 animate-spin" />{:else}{t('go')}{/if}
		</button>
	</div>
	{#if error}<p class="mt-1.5 text-base text-destructive">{t('notFound')}</p>{/if}
</form>
