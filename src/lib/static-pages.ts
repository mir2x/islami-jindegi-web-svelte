/** CMS-managed static pages (admin → Pages): public path → CMS slug and message namespace. */
export const STATIC_PAGE_CONFIG: Record<string, { slug: string; ns: string }> = {
	about: { slug: 'about', ns: 'AboutPage' },
	contact: { slug: 'contact', ns: 'ContactPage' },
	// Mirrors the old site's /donation route, which renders the CMS page with slug 'donation'.
	donate: { slug: 'donation', ns: 'DonatePage' },
	'important-matters': { slug: 'important-matters', ns: 'ImportantMattersPage' },
	'ask-masail': { slug: 'ask-masail', ns: 'AskMasailPage' },
	'privacy-policy': { slug: 'privacy-policy', ns: 'PrivacyPolicyPage' }
};

export const STATIC_PAGES = Object.keys(STATIC_PAGE_CONFIG);
