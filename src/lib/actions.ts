/** Calls `callback` whenever the element scrolls into view (with a 400px head start). */
export function inView(node: HTMLElement, callback: () => void) {
	const io = new IntersectionObserver((entries) => entries[0].isIntersecting && callback(), { rootMargin: '400px' });
	io.observe(node);
	return { destroy: () => io.disconnect() };
}
