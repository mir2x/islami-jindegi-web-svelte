import { defineParams } from '@sveltejs/kit/params';
import { CONTENT_SLUGS } from '#lib/admin/content/slugs.ts';
import { STATIC_PAGES } from '#lib/static-pages.ts';

export const params = defineParams({
	locale: (param) => (param === 'bn' || param === 'en' ? param : undefined),
	// Admin screens driven by one config each (see lib/admin/content).
	content: (param) => (CONTENT_SLUGS.includes(param) ? param : undefined),
	// CMS-driven static pages that share one route (see lib/static-pages.ts).
	staticpage: (param) => (STATIC_PAGES.includes(param) ? param : undefined)
});
