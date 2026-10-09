<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { toggleTheme } from '#lib/theme.ts';

	const t = useT('ThemeToggle');
</script>

<!-- Both icons are in the markup; CSS picks one from the root `dark` class, so there is no flash and no hydration state. -->
<button
	type="button"
	onclick={toggleTheme}
	aria-label={t('toggleTheme')}
	class="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
>
	<Sun class="hidden dark:block w-4.5 h-4.5" />
	<Moon class="dark:hidden w-4.5 h-4.5" />
</button>
