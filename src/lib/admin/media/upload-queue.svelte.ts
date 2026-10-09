import { NEXT_PUBLIC_API_URL } from '$app/env/public';
import type { MediaItem, MediaType } from '#lib/types.ts';
import { auth } from '../auth.svelte.ts';
import { validateUpload } from './files.ts';

const CONCURRENCY = 3;

export interface UploadJob {
	id: string;
	name: string;
	size: number;
	progress: number;
	status: 'queued' | 'uploading' | 'done' | 'error';
	error?: string;
}

/** POSTs one file with progress; XHR because fetch cannot report upload progress. */
function uploadFile(file: File, onProgress: (pct: number) => void): Promise<MediaItem> {
	return new Promise((resolve, reject) => {
		const form = new FormData();
		form.append('file', file);
		const xhr = new XMLHttpRequest();
		xhr.open('POST', `${NEXT_PUBLIC_API_URL}/api/media/upload`);
		const token = auth.peekToken();
		if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
		xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) return resolve(JSON.parse(xhr.responseText) as MediaItem);
			let msg = `Upload failed (${xhr.status})`;
			try {
				msg = JSON.parse(xhr.responseText)?.message ?? msg;
			} catch {
				/* use the default */
			}
			reject(new Error(msg));
		};
		xhr.onerror = () => reject(new Error('Network error: check your connection'));
		xhr.ontimeout = () => reject(new Error('Upload timed out'));
		xhr.send(form);
	});
}

/**
 * Uploads files a few at a time, however many are added and however often. Files the API would
 * reject are shown as failed jobs without being sent.
 */
export class UploadQueue {
	jobs = $state<UploadJob[]>([]);
	#pending: { id: string; file: File }[] = [];
	#running = 0;
	#batch: { uploaded: MediaItem[]; failed: number } = { uploaded: [], failed: 0 };

	constructor(
		private options: {
			/** Restricts uploads to one media type (e.g. a picker opened for audio). */
			accept?: MediaType;
			/** Runs once the queue drains, with the items uploaded since it last drained. */
			onIdle?: (uploaded: MediaItem[], failed: number) => void;
		} = {}
	) {}

	get active(): number {
		return this.jobs.filter((j) => j.status === 'queued' || j.status === 'uploading').length;
	}

	#patch(id: string, patch: Partial<UploadJob>) {
		const job = this.jobs.find((j) => j.id === id);
		if (job) Object.assign(job, patch);
	}

	enqueue = (files: File[]) => {
		for (const file of files) {
			const id = crypto.randomUUID();
			const error = validateUpload(file, this.options.accept);
			this.jobs.push({ id, name: file.name, size: file.size, progress: 0, status: error ? 'error' : 'queued', error: error ?? undefined });
			if (!error) this.#pending.push({ id, file });
		}
		this.#pump();
	};

	clear = () => {
		this.jobs = this.jobs.filter((j) => j.status === 'queued' || j.status === 'uploading');
	};

	#pump() {
		while (this.#running < CONCURRENCY && this.#pending.length > 0) {
			const { id, file } = this.#pending.shift()!;
			this.#running++;
			this.#patch(id, { status: 'uploading' });
			uploadFile(file, (progress) => this.#patch(id, { progress }))
				.then((item) => {
					this.#batch.uploaded.push(item);
					this.#patch(id, { status: 'done', progress: 100 });
				})
				.catch((err) => {
					this.#batch.failed++;
					this.#patch(id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' });
				})
				.finally(() => {
					this.#running--;
					if (this.#running === 0 && this.#pending.length === 0) {
						const { uploaded, failed } = this.#batch;
						this.#batch = { uploaded: [], failed: 0 };
						this.options.onIdle?.(uploaded, failed);
					}
					this.#pump();
				});
		}
	}
}
