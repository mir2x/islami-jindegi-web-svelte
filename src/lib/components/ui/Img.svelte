<script lang="ts">
	import { imageSources } from '#lib/image.ts';
	import { cn } from '#lib/utils.ts';

	interface Props {
		src: string;
		alt: string;
		/** `sizes` attribute: how wide the image renders at each breakpoint. */
		sizes: string;
		/** Above-the-fold image: load immediately. */
		eager?: boolean;
		class?: string;
	}
	let { src, alt, sizes, eager = false, class: className }: Props = $props();
	const sources = $derived(imageSources(src));
</script>

<!-- Fills its (relatively positioned) parent, like next/image `fill`. -->
<img
	src={sources.src}
	srcset={sources.srcset}
	{sizes}
	{alt}
	loading={eager ? 'eager' : 'lazy'}
	fetchpriority={eager ? 'high' : undefined}
	decoding="async"
	class={cn('absolute inset-0 w-full h-full', className)}
/>
