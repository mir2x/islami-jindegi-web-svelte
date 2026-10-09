/** Widths the resizing endpoint produces; requests snap up to the next one so the cache stays small. */
export const IMAGE_WIDTHS = [96, 192, 320, 480, 640, 828, 1080, 1600] as const;

const DEFAULT_BOOK = '/images/default-book.png';

export interface ImageSources {
	src: string;
	srcset?: string;
}

/** `src` / `srcset` for an image: remote CMS images go through `/api/img`, the bundled placeholder has prebuilt sizes. */
export function imageSources(url: string): ImageSources {
	if (url === DEFAULT_BOOK) {
		return { src: '/images/default-book-360.webp', srcset: '/images/default-book-360.webp 360w, /images/default-book-720.webp 720w' };
	}
	if (!/^https?:\/\//.test(url)) return { src: url };
	const at = (w: number) => `/api/img?url=${encodeURIComponent(url)}&w=${w}`;
	return { src: at(640), srcset: IMAGE_WIDTHS.map((w) => `${at(w)} ${w}w`).join(', ') };
}
