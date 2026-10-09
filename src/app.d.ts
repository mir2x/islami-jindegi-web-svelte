import type { SeoData } from '#lib/seo.ts';

declare global {
	namespace App {
		interface Error {
			message: string;
		}
		interface PageData {
			/** Head metadata (title, description, canonical, Open Graph, JSON-LD) for this page. */
			seo?: SeoData;
		}
	}
}

export {};
