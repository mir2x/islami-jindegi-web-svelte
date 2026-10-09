<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { cn } from '#lib/utils.ts';
	import { inputCls } from '../ui/classes.ts';
	import type { MediaBrowser } from './browser.svelte.ts';
	import { FILTER_TABS, type FilterType } from './files.ts';

	interface Props {
		browser: MediaBrowser;
		/** Only offer the given type (and All). */
		only?: FilterType;
		tabClass?: string;
		inputClass?: string;
	}
	let { browser, only, tabClass = 'px-4 py-2', inputClass }: Props = $props();

	let timer: ReturnType<typeof setTimeout>;
	const onsearch = (value: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => browser.setSearch(value), 250);
	};
	const tabs = $derived(only && only !== 'all' ? FILTER_TABS.filter((t) => t.value === 'all' || t.value === only) : FILTER_TABS);
</script>

<div class="relative flex-1 min-w-56 max-w-sm">
	<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
	<input placeholder="Search files..." value={browser.search} oninput={(e) => onsearch(e.currentTarget.value)} class={cn(inputCls, 'pl-9 bg-card', inputClass)} />
</div>

<div class="flex border rounded-lg overflow-hidden bg-card">
	{#each tabs as t (t.value)}
		<button
			type="button"
			onclick={() => browser.setType(t.value)}
			class={cn(
				'text-sm font-medium transition-colors',
				tabClass,
				browser.type === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
			)}
		>
			{t.label}
		</button>
	{/each}
</div>
