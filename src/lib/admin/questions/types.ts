export interface Question {
	id: string;
	email: string;
	question: string;
	locale: 'bn' | 'en';
	status: 'open' | 'answered';
	createdAt: string;
	answeredAt: string | null;
	/** Only on a single question. */
	answer?: string | null;
	answeredBy?: string | null;
	/** Why the last attempt to email the answer failed. */
	mailError?: string | null;
}

export interface QuestionPage {
	total: number;
	data: Question[];
}

export const PAGE_SIZE = 20;
export const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
