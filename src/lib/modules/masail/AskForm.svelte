<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Loader2 from '@lucide/svelte/icons/loader-circle';
	import { formatNum } from '#lib/calendar.ts';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';

	const MIN = 10;
	const MAX = 4000;

	const t = useT('AskMasailPage');
	const locale = $derived(currentLocale());

	let email = $state('');
	let question = $state('');
	/** A field only bots fill in: it is hidden from people and skipped by keyboards and screen readers. */
	let website = $state('');
	let status = $state<'idle' | 'sending' | 'sent'>('idle');
	let error = $state('');
	let sentTo = $state('');

	const length = $derived(question.trim().length);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (length < MIN) return void (error = t('errShort', { min: formatNum(MIN, locale) }));
		status = 'sending';
		try {
			const res = await fetch('/api/ask', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email: email.trim(), question: question.trim(), locale, website })
			});
			if (res.ok) {
				sentTo = email.trim();
				question = '';
				status = 'sent';
				return;
			}
			const code = (await res.json().catch(() => ({})))?.error;
			error = code === 'rate' ? t('errRate') : code === 'invalid' ? t('errInvalid') : t('errGeneric');
		} catch {
			error = t('errGeneric');
		}
		status = 'idle';
	}

	const field =
		'w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';
</script>

{#if status === 'sent'}
	<div class="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center space-y-3" role="status">
		<CircleCheck class="w-10 h-10 mx-auto text-primary" />
		<h2 class="text-xl font-bold text-foreground">{t('sentTitle')}</h2>
		<p class="text-base text-muted-foreground">{t('sentBody', { email: sentTo })}</p>
		<button type="button" class="text-sm font-semibold text-primary hover:underline" onclick={() => (status = 'idle')}>{t('askAnother')}</button>
	</div>
{:else}
	<form onsubmit={submit} class="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5" novalidate>
		<label class="block">
			<span class="block mb-1.5 text-sm font-semibold text-foreground">{t('emailLabel')}</span>
			<input type="email" name="email" required autocomplete="email" inputmode="email" bind:value={email} placeholder="name@example.com" class={field} />
			<span class="block mt-1 text-xs text-muted-foreground">{t('emailHint')}</span>
		</label>

		<label class="block">
			<span class="block mb-1.5 text-sm font-semibold text-foreground">{t('questionLabel')}</span>
			<textarea name="question" required rows="7" maxlength={MAX} bind:value={question} placeholder={t('questionPlaceholder')} class="{field} resize-y"></textarea>
			<span class="block mt-1 text-xs text-muted-foreground text-end tabular-nums">{formatNum(length, locale)} / {formatNum(MAX, locale)}</span>
		</label>

		<div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
			<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" bind:value={website} /></label>
		</div>

		{#if error}<p class="text-sm text-destructive" role="alert">{error}</p>{/if}

		<button
			type="submit"
			disabled={status === 'sending' || !email.trim() || length === 0}
			class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
		>
			{#if status === 'sending'}<Loader2 class="w-4 h-4 animate-spin" />{t('sending')}{:else}{t('send')}{/if}
		</button>
	</form>
{/if}
