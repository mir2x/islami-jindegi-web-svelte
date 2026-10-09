/** Filters, page and sort of each list, kept in memory so coming back from an editor lands where you left. */
export interface ListMemory {
	search: string;
	authorId: string;
	categoryId: string;
	published: string;
	offline: boolean;
	page: number;
	sort: string;
}

const memory = new Map<string, ListMemory>();

export const recall = (key: string, defaultSort: string): ListMemory =>
	memory.get(key) ?? { search: '', authorId: '', categoryId: '', published: '', offline: false, page: 1, sort: defaultSort };
export const remember = (key: string, state: ListMemory) => void memory.set(key, state);
