<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import Switch from '#lib/components/ui/Switch.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { authorsForModule, categoriesForModule } from '#lib/modules.ts';
	import { lookups } from '../lookups.svelte.ts';
	import { inputCls, inp } from '../ui/classes.ts';
	import Combobox from '../ui/Combobox.svelte';
	import Select from '../ui/Select.svelte';
	import type { ListMemory } from './list-memory.ts';
	import type { ContentConfig } from './types.ts';

	interface Props {
		config: ContentConfig;
		/** Mutated in place; changing a filter also resets the page. */
		state: ListMemory;
	}
	let { config, state: s = $bindable() }: Props = $props();

	const t = useT('Common');
	// svelte-ignore state_referenced_locally
	let text = $state(s.search);
	let timer: ReturnType<typeof setTimeout>;

	const authorOptions = $derived(authorsForModule(lookups.authors, config.module ?? '').map((a) => ({ id: a.id, label: a.name })));
	const categoryOptions = $derived(categoriesForModule(lookups.categories, config.module ?? '').map((c) => ({ id: c.id, label: c.title, child: !!c.parentId })));

	const apply = (patch: Partial<ListMemory>) => {
		Object.assign(s, patch, { page: 1 });
	};
	function onsearch(value: string) {
		text = value;
		clearTimeout(timer);
		timer = setTimeout(() => apply({ search: value }), 250);
	}
</script>

<div class="relative flex-1 min-w-56 max-w-sm">
	<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
	<input placeholder="Search {config.plural.toLowerCase()}..." value={text} oninput={(e) => onsearch(e.currentTarget.value)} class={inp('pl-9 bg-card')} />
</div>

{#if config.hasAuthor}
	<Combobox
		class="w-44"
		options={authorOptions}
		value={s.authorId}
		onchange={(v) => apply({ authorId: v as string })}
		placeholder="All authors"
		searchPlaceholder="Search authors..."
		emptyText="No authors found."
		clearable
		filter
	/>
{/if}
{#if config.module}
	<Combobox
		class="w-44"
		options={categoryOptions}
		value={s.categoryId}
		onchange={(v) => apply({ categoryId: v as string })}
		placeholder="All categories"
		searchPlaceholder="Search categories..."
		emptyText="No categories found."
		clearable
		filter
	/>
{/if}

<Select
	class="w-36"
	filter
	value={s.published}
	options={[
		{ value: '', label: 'All status' },
		{ value: 'true', label: 'Published' },
		{ value: 'false', label: 'Draft' }
	]}
	onchange={(v) => apply({ published: v })}
/>

{#if config.hasOffline}
	<label class="flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground">
		<Switch checked={s.offline} label={t('offlineFilterLabel')} onchange={(v) => apply({ offline: v })} />
		{t('offlineFilterLabel')}
	</label>
{/if}
