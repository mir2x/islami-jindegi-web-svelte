<script lang="ts">
	interface Props {
		/** More rows exist beyond the ones shown. */
		hasMore: boolean;
		/** A request is in flight; nothing is asked for until it ends. */
		loading: boolean;
		onmore: () => void;
	}
	let { hasMore, loading, onmore }: Props = $props();

	let el = $state<HTMLElement>();

	// Observing afresh each time `loading` ends re-checks a sentinel that is still in view because
	// the page it asked for was short, so the list keeps filling until it overflows or runs out.
	$effect(() => {
		if (!el || !hasMore || loading) return;
		const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && onmore(), { rootMargin: '400px' });
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div bind:this={el} class="h-px" aria-hidden="true"></div>
{#if hasMore}<p class="py-4 text-center text-xs text-muted-foreground">Loading more...</p>{/if}
