<script lang="ts">
	import BookOpenText from '@lucide/svelte/icons/book-open-text';
	import Settings from '@lucide/svelte/icons/settings';
	import Play from '@lucide/svelte/icons/play';
	import { useT } from '#lib/i18n/use-t.svelte.ts';
	import { cn } from '#lib/utils.ts';
	import PhoneFontSheet from './PhoneFontSheet.svelte';
	import WordByWordIcon from './WordByWordIcon.svelte';

	interface Props {
		translators: string[];
		selected: string[];
		ontoggle: (name: string) => void;
		showWords: boolean;
		onwords: () => void;
		onlisten: () => void;
		listenOpen: boolean;
		/** Called when the translation button is pressed, so the reader can close its other sheets. */
		onopen: () => void;
		settingsOpen: boolean;
		onsettings: () => void;
	}
	let { translators, selected, ontoggle, showWords, onwords, onlisten, listenOpen, onopen, settingsOpen, onsettings }: Props = $props();

	const t = useT('SurahReader');
	let open = $state(false);
	// English-named translators (Taqi Usmani) go last.
	const ordered = $derived([...translators].sort((a, b) => Number(/^[\x00-\x7F]+$/.test(a)) - Number(/^[\x00-\x7F]+$/.test(b))));
</script>

<!-- Phones only: a bottom bar (more items to come). -->
<div class="sm:hidden shrink-0 h-14 grid grid-cols-4 border-t border-border bg-background">
	<button type="button" onclick={() => { onopen(); open = !open; }} aria-pressed={open} class={cn('flex flex-col items-center gap-1 py-2 transition-colors', open ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
		<BookOpenText class="w-6 h-6" />
		<span class="text-xs">{t('translationShort')}</span>
	</button>
	<button type="button" onclick={onwords} aria-pressed={showWords} class={cn('flex flex-col items-center gap-1 py-2 transition-colors', showWords ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
		<WordByWordIcon class="w-6 h-6" />
		<span class="text-xs">{t('wordByWordShort')}</span>
	</button>
	<button type="button" onclick={() => { open = false; onlisten(); }} aria-pressed={listenOpen} class={cn('flex flex-col items-center gap-1 py-2 transition-colors', listenOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
		<Play class="w-6 h-6" />
		<span class="text-xs">{t('listenAudio')}</span>
	</button>
	<button type="button" onclick={() => { open = false; onsettings(); }} aria-pressed={settingsOpen} class={cn('flex flex-col items-center gap-1 py-2 transition-colors', settingsOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
		<Settings class="w-6 h-6" />
		<span class="text-xs">{t('settings')}</span>
	</button>
</div>

<PhoneFontSheet open={settingsOpen} onclose={onsettings} />

<!-- Translation picker: choose one or more translations. Sits above the bottom bar. -->
{#if open}
	<div class="sm:hidden absolute inset-x-0 top-0 bottom-14 z-[60] flex items-end">
		<button type="button" tabindex="-1" aria-label="Close" onclick={() => (open = false)} class="absolute inset-0 bg-black/50 cursor-default"></button>
		<div class="relative w-full bg-background rounded-t-3xl border-t border-border shadow-2xl max-h-[80%] flex flex-col overflow-hidden">
			<div class="mx-auto mt-2.5 h-1 w-10 rounded-full bg-muted-foreground/30 shrink-0"></div>
			<div class="px-5 pt-3 pb-3 shrink-0">
				<p class="text-lg font-bold text-foreground leading-tight">{t('translationShort')}</p>
				<p class="text-sm text-muted-foreground mt-0.5">{t('translationHint')}</p>
			</div>
			<ul class="overflow-y-auto px-5 pb-6 flex flex-wrap gap-2.5">
				{#each ordered as name (name)}
					{@const on = selected.includes(name)}
					<li>
						<button
							type="button"
							onclick={() => ontoggle(name)}
							aria-pressed={on}
							class={cn('px-4 py-2.5 rounded-full text-[15px] font-medium border transition-colors', on ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 text-foreground border-border hover:bg-muted')}
						>
							{name}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
