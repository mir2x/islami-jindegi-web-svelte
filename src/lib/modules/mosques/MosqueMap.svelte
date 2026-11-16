<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import type { Map as LMap, LayerGroup, Marker } from 'leaflet';
	import { onMount } from 'svelte';
	import type { Mosque } from '#lib/types/mosques.ts';
	import type { Point } from './geo.ts';

	interface Props {
		center: Point;
		/** The visitor's own position, when known. */
		you: Point | null;
		mosques: Mosque[];
		selectedId: string | null;
		zoom: number;
		attribution: string;
		onselect: (id: string) => void;
		/** The map was dragged or zoomed to this view. */
		onmoved: (center: Point) => void;
	}
	let { center, you, mosques, selectedId, zoom, attribution, onselect, onmoved }: Props = $props();

	let el: HTMLDivElement;
	let L: typeof import('leaflet');
	let map: LMap | undefined;
	let layer: LayerGroup | undefined;
	let youMarker: Marker | undefined;
	let ready = $state(false);

	const pin = (selected: boolean) =>
		L.divIcon({
			className: 'ij-pin',
			html: `<svg viewBox="0 0 24 32" width="${selected ? 36 : 26}" height="${selected ? 48 : 35}"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20 12 32 12 32s12-12 12-20.3C24 5.2 18.6 0 12 0z" fill="${selected ? '#b45309' : '#047857'}" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="11.5" r="4.5" fill="#fff"/></svg>`,
			iconSize: selected ? [36, 48] : [26, 35],
			iconAnchor: selected ? [18, 48] : [13, 35]
		});

	/** Back to the search point, wherever the visitor has dragged the view. */
	export function recenter() {
		if (ready) map!.setView([center.lat, center.lng], zoom);
	}

	onMount(() => {
		let gone = false;
		import('leaflet').then((mod) => {
			if (gone) return;
			L = mod.default ?? mod;
			map = L.map(el, { zoomControl: true, attributionControl: true }).setView([center.lat, center.lng], zoom);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution }).addTo(map);
			layer = L.layerGroup().addTo(map);
			map.on('moveend', () => {
				const c = map!.getCenter();
				onmoved({ lat: c.lat, lng: c.lng });
			});
			ready = true;
		});
		// Leaflet keeps the top-left corner fixed when its box changes size, so a map that started before the layout settled
		// (or on a rotating phone) would show another place. Re-measure, and re-centre once on the first real size.
		let sized = false;
		const watch = new ResizeObserver(() => {
			if (!map) return;
			map.invalidateSize({ pan: false });
			if (!sized && el.clientHeight > 0) {
				sized = true;
				map.setView([center.lat, center.lng], zoom);
			}
		});
		watch.observe(el);
		return () => {
			gone = true;
			watch.disconnect();
			map?.remove();
		};
	});

	// Re-centre when the search point or radius changes (not on every drag: `center` is the search point, not the view).
	$effect(() => {
		if (ready) map!.setView([center.lat, center.lng], zoom);
	});

	$effect(() => {
		if (!ready) return;
		layer!.clearLayers();
		for (const m of mosques) {
			const selected = m.id === selectedId;
			L.marker([m.lat, m.lng], { icon: pin(selected), zIndexOffset: selected ? 1000 : 0, keyboard: true })
				.on('click', () => onselect(m.id))
				.addTo(layer!);
		}
	});

	$effect(() => {
		if (!ready) return;
		youMarker?.remove();
		youMarker = you
			? L.marker([you.lat, you.lng], {
					icon: L.divIcon({ className: 'ij-you', html: '<span></span>', iconSize: [18, 18] }),
					interactive: false
				}).addTo(map!)
			: undefined;
	});

	$effect(() => {
		const m = mosques.find((x) => x.id === selectedId);
		if (ready && m) map!.panTo([m.lat, m.lng], { animate: true });
	});
</script>

<div bind:this={el} class="w-full h-full min-h-64 bg-muted z-0"></div>

<style>
	:global(.ij-pin) {
		background: none;
		border: none;
		filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.35));
	}
	:global(.ij-you) {
		background: none;
		border: none;
	}
	:global(.ij-you span) {
		display: block;
		width: 18px;
		height: 18px;
		border-radius: 9999px;
		background: #2563eb;
		border: 3px solid #fff;
		box-shadow: 0 0 0 4px rgb(37 99 235 / 0.25);
	}
</style>
