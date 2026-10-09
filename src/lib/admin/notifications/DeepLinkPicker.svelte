<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { untrack } from 'svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import type { PagedResult, TopicIndex } from '#lib/types.ts';
	import { api, qs } from '../api.ts';
	import { inputCls, triggerCls, inp } from '../ui/classes.ts';
	import Combobox, { type ComboOption } from '../ui/Combobox.svelte';
	import { cn } from '#lib/utils.ts';
	import { ITEMS, SCREENS, SURA_PREFIX, TOPIC_PREFIX, kindOf, type Kind } from './deep-links.ts';

	interface Props {
		value: string;
		onchange: (path: string) => void;
		disabled?: boolean;
	}
	let { value, onchange, disabled }: Props = $props();

	const t = useT('Notifications');
	// Seeded once: the picker is mounted per notification.
	let kind = $state<Kind>(untrack(() => (value ? kindOf(value) : 'screen:home')));
	let options = $state<ComboOption[]>([]);
	let selectedTitle = $state<string | null>(null);
	let seq = 0;

	const item = $derived(kind.startsWith('item:') ? ITEMS.find((i) => `item:${i.key}` === kind) : undefined);
	const prefix = $derived(item?.prefix ?? (kind === 'topic' ? TOPIC_PREFIX : null));
	const hasSelection = $derived(prefix !== null && value.startsWith(prefix) && value.length > prefix.length);
	const comboValue = $derived(hasSelection && prefix ? value.slice(prefix.length) : '');
	const kindLabel = (k: string) => t(`screens.${k.includes(':') ? k.split(':')[1] : k}`);

	// An empty value defaults to the home screen, so the form never saves a blank path.
	$effect(() => {
		if (!value) onchange('/');
	});

	function changeKind(next: Kind) {
		kind = next;
		selectedTitle = null;
		options = [];
		if (next.startsWith('screen:')) onchange(SCREENS.find((s) => `screen:${s.key}` === next)!.path);
		else if (next === 'sura') onchange(`${SURA_PREFIX}1`);
		else if (next === 'custom') onchange(value || '/');
	}

	let timer: ReturnType<typeof setTimeout>;
	function search(query: string) {
		clearTimeout(timer);
		const mine = ++seq;
		timer = setTimeout(async () => {
			try {
				let found: ComboOption[];
				if (item) {
					const res = await api.get<PagedResult<{ id: string; title: string }>>(`${item.api}?${qs({ page: 1, pageSize: 20, published: true, search: query.trim() })}`);
					found = res.data.map((o) => ({ id: o.id, label: o.title }));
				} else {
					// Topics have no search endpoint; the index is small and cached, so filter locally.
					const index = await api.get<TopicIndex>('/api/topics');
					const needle = query.trim().toLowerCase();
					found = [...index.groups.flatMap((g) => g.topics), ...index.ungrouped]
						.filter((o) => !needle || o.title.toLowerCase().includes(needle))
						.slice(0, 50)
						.map((o) => ({ id: o.slug || o.id, label: o.title }));
				}
				if (mine === seq) options = found;
			} catch {
				if (mine === seq) options = [];
			}
		}, 250);
	}
</script>

<div class="space-y-2">
	<div class="relative">
		<select {disabled} value={kind} onchange={(e) => changeKind(e.currentTarget.value)} class={cn(triggerCls, 'appearance-none pr-8 bg-card')}>
			<optgroup label={t('linkGroupScreens')}>
				{#each SCREENS as s (s.key)}<option value="screen:{s.key}">{t(`screens.${s.key}`)}</option>{/each}
			</optgroup>
			<optgroup label={t('linkGroupItems')}>
				{#each ITEMS as i (i.key)}<option value="item:{i.key}">{t(`screens.${i.key}`)}</option>{/each}
				<option value="topic">{t('screens.topic')}</option>
				<option value="sura">{t('screens.sura')}</option>
			</optgroup>
			<optgroup label="">
				<option value="custom">{t('screens.custom')}</option>
			</optgroup>
		</select>
		<ChevronDown class="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
	</div>

	{#if prefix !== null}
		{#key kind}
			<Combobox
				{options}
				value={comboValue}
				valueLabel={selectedTitle ?? comboValue}
				placeholder={t('pickItem')}
				searchPlaceholder={t('searchItems')}
				emptyText={t('noItems')}
				onsearch={search}
				onchange={(id) => {
					selectedTitle = options.find((o) => o.id === id)?.label ?? null;
					onchange(`${prefix}${id}`);
				}}
			/>
		{/key}
	{/if}

	{#if kind === 'sura'}
		<input
			type="number"
			min="1"
			max="114"
			{disabled}
			value={value.startsWith(SURA_PREFIX) ? value.slice(SURA_PREFIX.length) : ''}
			oninput={(e) => onchange(`${SURA_PREFIX}${e.currentTarget.value}`)}
			placeholder={t('suraNumber')}
			class={inputCls}
		/>
	{/if}
	{#if kind === 'custom'}
		<input {value} {disabled} oninput={(e) => onchange(e.currentTarget.value)} placeholder="/books/…" class={inp('font-mono text-sm')} />
	{/if}

	<p class="text-xs text-muted-foreground">{t('opensPath')} <code class="font-mono">{value || '/'}</code></p>
</div>
