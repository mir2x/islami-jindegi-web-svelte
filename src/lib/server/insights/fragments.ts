/**
 * The definitions every Insights number shares, so two cards never disagree about what a "reader" is.
 * Nothing from a request is ever interpolated into these.
 */
/** The public site's requests (nginx also logs the API host in the same stream). */
export const SITE = "from web_access where status > 0 and ij_unit = 'ij-web.service'";

/** Not a declared bot or a script. Scrapers that pose as browsers still pass: see READER_FLOOR. */
export const HUMAN = "not is_bot and ua not like 'msh-%' and ua not like '%okhttp%'";

/** A page (not a script, image or data file) that a browser asked for. */
export const PAGE = "accept like '%text/html%'";

/** Paths scanners probe for; none of them exist on this site. */
export const PROBE =
	"(path like '%.php%' or path like '%wp-%' or path like '%.env%' or path like '%/.git%' or path like '%phpmyadmin%' or path like '%.sql%' or path like '%.bak%' or path like '%xmlrpc%' or path like '%/.aws%')";

/** A visitor is an address plus a browser; one person on mobile data can be several. */
export const VISITOR = 'ip || ua';

export const day = (s: unknown) => String(s).slice(0, 10);
export const DAY = 86_400;

/** A path as people read it: `%E0%A6...` becomes the Bangla it spells; anything that does not decode stays as is. */
export const readable = (path: string) => {
	try {
		return decodeURIComponent(path);
	} catch {
		return path;
	}
};
