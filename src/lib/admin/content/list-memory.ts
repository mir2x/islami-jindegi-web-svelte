/** Filters and sort of each list, kept in memory so coming back from an editor lands where you left. The page is not: rows load from the top as you scroll. */
export interface ListMemory {
	search: string;
	authorId: string;
	categoryId: string;
	published: string;
	/** '' (all), 'true' (audio) or 'false' (text only). */
	audio: string;
	offline: boolean;
	page: number;
	sort: string;
}

const memory = new Map<string, ListMemory>();

export const recall = (key: string, defaultSort: string): ListMemory => ({
	...(memory.get(key) ?? { search: '', authorId: '', categoryId: '', published: '', audio: '', offline: false, page: 1, sort: defaultSort }),
	page: 1
});
export const remember = (key: string, state: ListMemory) => void memory.set(key, state);
