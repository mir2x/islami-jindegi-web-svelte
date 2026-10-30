import { defineEnvVars } from '@sveltejs/kit/env';

/** Read when the server starts (not baked in at build time), so changing one only needs a restart. */
export const variables = defineEnvVars({
	COMPRESS: {
		description: 'Compress dynamic responses (brotli/gzip). Set to 0 when a reverse proxy already does it.',
		schema: (value) => value !== '0'
	},
	API_INTERNAL_URL: {
		description:
			'Optional base URL the server uses to reach the API from inside the host network (e.g. http://ij-backend:8080). The visitor IP is forwarded as x-client-ip so the API rate-limits per visitor, not per web server. Unset: the server uses PUBLIC_API_URL.',
		schema: (value) => (value ?? '').replace(/\/$/, '')
	},
	PUBLIC_API_URL: {
		public: true,
		description: 'Base URL of the Islami Jindegi API, e.g. https://api.islamijindegi.com',
		schema: (value) => (value ?? '').replace(/\/$/, '')
	},
	PUBLIC_SITE_URL: {
		public: true,
		description: 'Canonical origin of this site, used for sitemaps and absolute URLs',
		schema: (value) => (value || 'https://islamijindegi.com').replace(/\/$/, '')
	},
	PUBLIC_GOOGLE_CLIENT_ID: {
		public: true,
		description: 'Google OAuth client id for the admin sign-in button',
		schema: (value) => value ?? ''
	},
	PUBLIC_NOINDEX: {
		public: true,
		description: 'Set to 1 to make robots, sitemap and meta all noindex (unset in production)',
		schema: (value) => value ?? ''
	}
});
