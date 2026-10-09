<script lang="ts">
	import FileDown from '@lucide/svelte/icons/file-down';
	import { downloadUrl } from '#lib/utils.ts';

	let { url, filename, label, class: className }: { url: string; filename: string; label: string; class?: string } = $props();
</script>

<a
	download
	href={downloadUrl(url, filename)}
	class={className ?? 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors'}
>
	<FileDown class="w-4 h-4" />{label}
</a>
