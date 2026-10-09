<script lang="ts">
	import { page } from '$app/state';
	import { currentLocale, useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';

	let { class: className = '' }: { class?: string } = $props();
	const t = useT('Common');
	const locale = $derived(currentLocale());

	// Same page in the other language: swap the prefix, keep the rest (including the query).
	const hrefFor = (target: string) => page.url.pathname.replace(/^\/(bn|en)(?=\/|$)/, `/${target}`) + page.url.search;
	const OPTIONS = [
		{ locale: 'bn', label: 'বাং' },
		{ locale: 'en', label: 'EN' }
	];
</script>

<div role="group" aria-label={t('languageSwitcherLabel')} class={cn('flex items-center rounded-lg border border-border/60 p-0.5 text-[13px] font-medium', className)}>
	{#each OPTIONS as option (option.locale)}
		<a
			href={hrefFor(option.locale)}
			hreflang={option.locale}
			aria-current={locale === option.locale ? 'true' : undefined}
			class={cn('px-2 py-1 rounded-md transition-colors', locale === option.locale ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
		>
			{option.label}
		</a>
	{/each}
</div>
