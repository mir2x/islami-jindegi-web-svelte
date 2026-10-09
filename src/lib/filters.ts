/** One entry of an author/category filter list. */
export interface FilterOption {
	id: string;
	label: string;
	count: number;
}

export interface DateRange {
	from: string;
	to: string;
}
