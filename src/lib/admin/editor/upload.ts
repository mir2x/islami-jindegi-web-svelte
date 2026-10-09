import { NEXT_PUBLIC_API_URL } from '$app/env/public';
import { auth } from '../auth.svelte.ts';

/** Uploads an inline image to the API and resolves to its public URL. */
export async function uploadEditorImage(file: File): Promise<string> {
	const form = new FormData();
	form.append('file', file);
	const token = auth.peekToken();
	const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/upload/image`, { method: 'POST', body: form, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
	if (!res.ok) throw new Error('Image upload failed');
	return (await res.json()).url as string;
}
