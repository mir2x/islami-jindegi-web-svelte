import { goto } from '$app/navigation';
import { localePath } from '#lib/i18n/use-t.svelte.ts';
import { goBack } from '../navigate.ts';
import { ApiError, api } from '../api.ts';
import { toast } from '../toast.svelte.ts';

interface Options {
	/** Collection path, e.g. `/api/pages`. */
	apiPath: string;
	/** Present when editing. */
	id?: string;
	payload: unknown;
	/** Toast name: "Page" → "Page updated" / "Page created". */
	name: string;
	/** Where to go afterwards; back (or `fallback` in a fresh tab) when omitted. */
	redirect?: string;
	fallback?: string;
	/** Error toast; a 409 shows the API's message instead when `conflictMessage` is set. */
	failMessage?: string;
	conflictMessage?: string;
}

/** POST or PUT a form, toast the result and navigate away. Resolves true on success. */
export async function saveForm({ apiPath, id, payload, name, redirect, fallback = '/admin', failMessage = 'Something went wrong', conflictMessage }: Options): Promise<boolean> {
	try {
		if (id) await api.put(`${apiPath}/${id}`, payload);
		else await api.post(apiPath, payload);
		toast.success(`${name} ${id ? 'updated' : 'created'}`);
		if (redirect) await goto(localePath(redirect));
		else goBack(fallback);
		return true;
	} catch (err) {
		toast.error(err instanceof ApiError && err.status === 409 && conflictMessage ? conflictMessage : failMessage);
		return false;
	}
}
