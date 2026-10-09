import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export type { PDFDocumentProxy };

/** Starts loading a PDF; `destroy` cancels the transfer and frees the worker. */
export function openPdf(url: string) {
	const task = pdfjs.getDocument({ url });
	return { promise: task.promise, destroy: () => void task.destroy() };
}

export { pdfjs };
