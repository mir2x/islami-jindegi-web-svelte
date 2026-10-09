<script lang="ts">
	import { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID as CLIENT_ID } from '$app/env/public';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { localePath, useT } from '#lib/i18n/use-t.svelte.ts';
	import { auth } from '../auth.svelte.ts';
	import { toast } from '../toast.svelte.ts';

	interface GoogleId {
		initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
		renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
	}

	const t = useT('AdminNav');
	let button = $state<HTMLDivElement>();

	async function onCredential(response: { credential: string }) {
		try {
			const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/auth/google`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken: response.credential })
			});
			if (!res.ok) return toast.error('This account is not an admin');
			const { token, email } = await res.json();
			auth.set(token, email);
			await goto(localePath('/admin'));
		} catch (e) {
			console.error('Google sign-in failed', e);
			toast.error('Sign-in failed');
		}
	}

	onMount(() => {
		if (!CLIENT_ID) return console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
		const init = () => {
			const google = (window as unknown as { google?: { accounts: { id: GoogleId } } }).google;
			if (!google || !button) return;
			google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential });
			google.accounts.id.renderButton(button, { theme: 'outline', size: 'large', text: 'signin_with' });
		};
		if ((window as unknown as { google?: unknown }).google) return init();
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.onload = init;
		document.body.appendChild(script);
	});
</script>

<div class="flex h-screen items-center justify-center bg-sidebar">
	<div class="flex flex-col items-center gap-6 p-10 rounded-2xl border border-sidebar-border bg-background shadow-xl">
		<div
			class="w-12 h-12 rounded-xl bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-base font-black tracking-wider shadow-lg shadow-sidebar-primary/30"
		>
			IJ
		</div>
		<div class="text-center">
			<p class="text-lg font-bold">{t('brand')} {t('brandSub')}</p>
			<p class="text-sm text-muted-foreground mt-1">{t('signInPrompt')}</p>
		</div>
		<div bind:this={button}></div>
	</div>
</div>
