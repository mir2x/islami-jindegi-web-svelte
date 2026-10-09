<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import LinkIcon from '@lucide/svelte/icons/link';
	import Share2 from '@lucide/svelte/icons/share-2';
	import BrandIcon from '#lib/components/icons/BrandIcon.svelte';
	import Popover from '#lib/components/ui/Popover.svelte';
	import { useT } from '#lib/i18n/use-t.svelte.ts';

	interface Props {
		url: string;
		title: string;
		/** Plain text copied by the standalone Copy button: the content itself, not the link. */
		content: string;
	}
	let { url, title, content }: Props = $props();

	const t = useT('ShareMenu');
	let contentCopied = $state(false);
	let linkCopied = $state(false);

	async function copy(text: string, mark: (done: boolean) => void) {
		await navigator.clipboard.writeText(text);
		mark(true);
		setTimeout(() => mark(false), 1800);
	}

	function shareTo(platform: 'facebook' | 'x' | 'whatsapp') {
		const u = encodeURIComponent(url);
		const text = encodeURIComponent(title);
		const links = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
			x: `https://twitter.com/intent/tweet?url=${u}&text=${text}`,
			whatsapp: `https://wa.me/?text=${text}%20${u}`
		};
		window.open(links[platform], '_blank', 'noopener,noreferrer');
	}

	const iconButton = 'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';
	const item = 'w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-left hover:bg-muted transition-colors';
	const PLATFORMS = [
		{ key: 'facebook', icon: 'facebook' },
		{ key: 'x', icon: 'x' },
		{ key: 'whatsapp', icon: 'whatsapp' }
	] as const;
</script>

<button type="button" onclick={() => copy(content, (v) => (contentCopied = v))} title={t('copyContent')} aria-label={t('copyContent')} class={iconButton}>
	{#if contentCopied}<Check class="w-4.5 h-4.5 text-primary" />{:else}<Copy class="w-4.5 h-4.5" />{/if}
</button>

<Popover label={t('share')} title={t('share')} align="end" triggerClass={iconButton} class="min-w-[190px] p-1">
	{#snippet trigger()}<Share2 class="w-4.5 h-4.5" />{/snippet}
	<button type="button" class={item} onclick={() => copy(url, (v) => (linkCopied = v))}>
		{#if linkCopied}<Check class="w-4 h-4 text-primary" />{:else}<LinkIcon class="w-4 h-4" />{/if}
		{t('copyLink')}
	</button>
	<div class="my-1 h-px bg-border"></div>
	{#each PLATFORMS as p (p.key)}
		<button type="button" class={item} onclick={() => shareTo(p.key)}>
			<BrandIcon name={p.icon} class="w-4 h-4" />{t(p.key)}
		</button>
	{/each}
</Popover>
