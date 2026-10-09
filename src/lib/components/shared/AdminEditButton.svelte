<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import { auth } from '#lib/admin/auth.svelte.ts';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';

	/** Floating "Edit" shortcut to the admin editor of what is on screen; only rendered for a signed-in admin. */
	let { entity, id }: { entity: 'articles' | 'bayan' | 'books' | 'chapters' | 'subchapters' | 'dua' | 'malfuzat' | 'masail' | 'news'; id: string } = $props();

	const t = useT('Common');
</script>

{#if auth.token}
	<a
		href={localePath(`/admin/${entity}/${id}/edit`)}
		class="print:hidden fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
	>
		<Pencil class="w-4 h-4" />
		<span class="text-sm font-medium">{t('edit')}</span>
	</a>
{/if}
