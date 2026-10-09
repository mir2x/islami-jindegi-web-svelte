<script lang="ts">
	import 'pdfjs-dist/web/pdf_viewer.css';
	import { pdfjs, type PDFDocumentProxy } from './pdf-doc.ts';

	interface Props {
		doc: PDFDocumentProxy;
		pageNumber: number;
		/** CSS pixel height the page is scaled to. */
		height: number;
		class?: string;
	}
	let { doc, pageNumber, height, class: className = '' }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();
	let textLayer = $state<HTMLDivElement>();
	// Until the first page renders, assume A4 proportions.
	// svelte-ignore state_referenced_locally
	let width = $state(height * 0.707);

	// Renders the page to a canvas plus a selectable text layer; a new page/height cancels the old render.
	$effect(() => {
		if (!canvas || !textLayer) return;
		const target = canvas;
		const layer = textLayer;
		const num = pageNumber;
		const h = height;
		let cancelled = false;
		let renderTask: { cancel: () => void } | undefined;
		let text: { cancel: () => void } | undefined;

		(async () => {
			const page = await doc.getPage(num);
			if (cancelled) return;
			const base = page.getViewport({ scale: 1 });
			const viewport = page.getViewport({ scale: h / base.height });
			const dpr = window.devicePixelRatio || 1;
			width = viewport.width;
			target.width = Math.floor(viewport.width * dpr);
			target.height = Math.floor(viewport.height * dpr);

			const task = page.render({ canvas: target, viewport, transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0] });
			renderTask = task;
			layer.replaceChildren();
			layer.style.setProperty('--scale-factor', String(viewport.scale));
			layer.style.setProperty('--total-scale-factor', String(viewport.scale));
			const textLayerTask = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: layer, viewport });
			text = textLayerTask;
			await Promise.all([task.promise, textLayerTask.render()]).catch(() => {});
		})().catch(() => {});

		return () => {
			cancelled = true;
			renderTask?.cancel();
			text?.cancel();
		};
	});
</script>

<div class="relative bg-white {className}" style:width="{width}px" style:height="{height}px">
	<canvas bind:this={canvas} class="block w-full h-full"></canvas>
	<div bind:this={textLayer} class="textLayer"></div>
</div>
