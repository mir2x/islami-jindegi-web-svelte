<script lang="ts">
	import { authorsForModule, categoriesForModule } from '#lib/modules.ts';
	import type { Category } from '#lib/types.ts';
	import { lookups } from '../lookups.svelte.ts';
	import RichEditor from '../editor/RichEditor.svelte';
	import MediaField from '../media/MediaField.svelte';
	import Checkbox from '../ui/Checkbox.svelte';
	import { inputCls, textareaCls } from '../ui/classes.ts';
	import Combobox, { type ComboOption } from '../ui/Combobox.svelte';
	import MultiPicker from '../ui/MultiPicker.svelte';
	import Field from '../ui/Field.svelte';
	import Select from '../ui/Select.svelte';
	import { LANGUAGES } from './fields.ts';
	import type { Values } from './form-values.ts';
	import type { ContentConfig, FieldDef } from './types.ts';

	interface Props {
		config: ContentConfig;
		field: FieldDef;
		values: Values;
		/** The record's own categories, used for chip labels before the category list has loaded. */
		known?: Category[];
	}
	let { config, field: f, values = $bindable(), known = [] }: Props = $props();

	const authorOptions = $derived<ComboOption[]>(authorsForModule(lookups.authors, config.module ?? '').map((a) => ({ id: a.id, label: a.name })));
	const categoryOptions = $derived<ComboOption[]>(categoriesForModule(lookups.categories, config.module ?? '').map((c) => ({ id: c.id, label: c.title, child: !!c.parentId })));
	const star = $derived(!!f.required || !!f.mark);
</script>

{#if !f.when || f.when(values)}
	{#if f.kind === 'checkbox'}
		<Checkbox bind:checked={values[f.key]}>{f.label}</Checkbox>
	{:else if f.kind === 'rich'}
		<RichEditor bind:value={values[f.key]} placeholder={f.placeholder} class={f.height} />
	{:else}
		<Field label={f.label ?? ''} required={star} hint={f.hint}>
			{#if f.kind === 'text'}
				<input bind:value={values[f.key]} placeholder={f.placeholder} maxlength={f.maxLength} class={inputCls} />
			{:else if f.kind === 'textarea'}
				<textarea bind:value={values[f.key]} placeholder={f.placeholder} rows={f.rows} maxlength={f.maxLength} class={textareaCls}></textarea>
				{#if f.counter}<p class="text-xs text-muted-foreground text-right">{values[f.key].length}/{f.maxLength}</p>{/if}
			{:else if f.kind === 'language'}
				<Select class="w-fit" bind:value={values[f.key]} options={LANGUAGES} />
			{:else if f.kind === 'position'}
				<input type="number" min="1" bind:value={values[f.key]} placeholder="Auto" class={inputCls} />
			{:else if f.kind === 'date'}
				<input type="date" bind:value={values[f.key]} class={inputCls} />
			{:else if f.kind === 'author'}
				<Combobox
					options={authorOptions}
					bind:value={values[f.key]}
					placeholder="Select author..."
					searchPlaceholder="Search authors..."
					emptyText="No authors found."
					triggerClass="bg-background"
					clearable
				/>
			{:else if f.kind === 'categories'}
				<MultiPicker
					options={categoryOptions}
					bind:value={values[f.key]}
					placeholder="Select categories..."
					searchPlaceholder="Search categories..."
					emptyText="No categories found."
					fallbackLabel={(id) => known.find((c) => c.id === id)?.title}
				/>
			{:else if f.kind === 'media'}
				<MediaField accept={f.accept} bind:value={values[f.key]} placeholder={f.placeholder} />
			{/if}
		</Field>
	{/if}
{/if}
