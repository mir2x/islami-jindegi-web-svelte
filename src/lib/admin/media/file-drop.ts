import type { Action } from 'svelte/action';

interface Options {
	onfiles: (files: File[]) => void;
	/** Reports whether a file drag is over the zone (for the overlay). */
	ondrag: (dragging: boolean) => void;
}

const hasFiles = (e: DragEvent) => !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');

/** Makes an element a file drop zone. dragenter/dragleave fire for every child crossed, so depth is counted. */
export const fileDrop: Action<HTMLElement, Options> = (node, options) => {
	let opts = options;
	let depth = 0;

	const enter = (e: DragEvent) => {
		if (!hasFiles(e)) return;
		e.preventDefault();
		depth++;
		opts.ondrag(true);
	};
	const over = (e: DragEvent) => {
		if (!hasFiles(e)) return;
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'copy';
	};
	const leave = (e: DragEvent) => {
		if (!hasFiles(e)) return;
		depth = Math.max(0, depth - 1);
		if (depth === 0) opts.ondrag(false);
	};
	const drop = (e: DragEvent) => {
		if (!hasFiles(e)) return;
		e.preventDefault();
		depth = 0;
		opts.ondrag(false);
		const files = Array.from(e.dataTransfer!.files);
		if (files.length > 0) opts.onfiles(files);
	};

	node.addEventListener('dragenter', enter);
	node.addEventListener('dragover', over);
	node.addEventListener('dragleave', leave);
	node.addEventListener('drop', drop);
	return {
		update: (next) => (opts = next),
		destroy() {
			node.removeEventListener('dragenter', enter);
			node.removeEventListener('dragover', over);
			node.removeEventListener('dragleave', leave);
			node.removeEventListener('drop', drop);
		}
	};
};
