<script lang="ts">
	import { onMount } from 'svelte';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import X from '@lucide/svelte/icons/x';
	import { currentLocale } from '#lib/i18n/use-t.svelte.ts';

	const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.islami_jindegi';
	const APP_STORE_URL = 'https://apps.apple.com/app/islami-jindegi/id1271205014';
	const DISMISSED_KEY = 'ij_app_banner_dismissed';

	// '' on the server and until mounted; only phones get a banner, and only until dismissed.
	let platform = $state<'android' | 'ios' | ''>('');
	const isBn = $derived(currentLocale() === 'bn');

	onMount(() => {
		try {
			if (sessionStorage.getItem(DISMISSED_KEY)) return;
		} catch {
			/* storage unavailable: show the banner */
		}
		const ua = navigator.userAgent || '';
		if (/android/i.test(ua)) platform = 'android';
		else if (/iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream) platform = 'ios';
	});

	function dismiss() {
		try {
			sessionStorage.setItem(DISMISSED_KEY, '1');
		} catch {
			/* ignore */
		}
		platform = '';
	}
</script>

{#if platform}
	<aside
		aria-label="Mobile App Banner"
		class="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-sm px-3 py-2.5 flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-top-2"
	>
		<div class="flex items-center gap-2.5 min-w-0">
			<button onclick={dismiss} class="p-1 -ml-1 text-muted-foreground hover:text-foreground rounded-full transition-colors shrink-0" aria-label="Dismiss">
				<X class="w-4 h-4" />
			</button>
			<img src="/logo-72.webp" alt="" width="36" height="36" class="w-9 h-9 shrink-0 rounded-xl shadow-xs bg-primary/10" />
			<div class="min-w-0 flex-1">
				<p class="font-semibold text-foreground truncate text-[13px] leading-tight">{isBn ? 'ইসলামী যিন্দেগী' : 'Islami Jindegi'}</p>
				<p class="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
					{isBn ? 'অ্যাপটিতে সহজে পড়ুন ও অডিও শুনুন' : 'Read & listen in the official mobile app'}
				</p>
			</div>
		</div>
		<a
			href={platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL}
			target="_blank"
			rel="noopener noreferrer"
			class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors shadow-xs"
		>
			<span>{isBn ? 'অ্যাপে খুলুন' : platform === 'ios' ? 'Open in App' : 'Get the App'}</span>
			<ExternalLink class="w-3 h-3 opacity-80" />
		</a>
	</aside>
{/if}
