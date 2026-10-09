/** Strips HTML markup down to plain text. Browser only: server-side it returns the input unchanged. */
export function htmlToText(html: string): string {
	if (typeof document === 'undefined') return html;
	const div = document.createElement('div');
	div.innerHTML = html;
	return (div.textContent ?? '').trim();
}
