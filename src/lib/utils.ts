import { NEXT_PUBLIC_API_URL } from '$app/env/public';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Files (e.g. bayan audio, article PDFs) are served from a different origin, so a plain
// <a download> is ignored and the browser opens its built-in player/viewer instead. The API
// redirects to a presigned storage URL that carries Content-Disposition: attachment, so the
// browser saves the file natively (downloads bar, progress) under our filename.
export function buildDownloadFilename(title: string, authorName: string, fileUrl: string) {
	const ext = fileUrl.match(/\.\w+$/)?.[0] ?? '';
	return `${title} - ${authorName}${ext}`;
}

export function downloadUrl(fileUrl: string, filename: string) {
	return `${NEXT_PUBLIC_API_URL}/api/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(filename)}`;
}
