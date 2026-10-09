import { StoredValue } from '#lib/storage/stored.svelte.ts';

/** Same key and shape (zustand `persist`) as the Next.js dashboard, so an existing sign-in carries over. */
interface Persisted {
	state: { token: string | null; email: string | null };
	version: number;
}

const stored = new StoredValue<Persisted>('ij-admin-auth', { state: { token: null, email: null }, version: 0 });

export const auth = {
	get token() {
		return stored.current?.state?.token ?? null;
	},
	get email() {
		return stored.current?.state?.email ?? null;
	},
	/** Non-reactive read for the request layer. */
	peekToken: () => stored.read()?.state?.token ?? null,
	set: (token: string, email: string) => stored.set({ state: { token, email }, version: 0 }),
	clear: () => stored.set({ state: { token: null, email: null }, version: 0 })
};
