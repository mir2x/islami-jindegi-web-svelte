import type { SeoData } from '#lib/seo.ts';

declare global {
	namespace App {
		interface Error {
			message: string;
			/** The id this request was logged under, shown on the error page so a report can be traced. */
			requestId?: string;
		}
		interface PageData {
			/** Head metadata (title, description, canonical, Open Graph, JSON-LD) for this page. */
			seo?: SeoData;
		}
	}
}

export {};
