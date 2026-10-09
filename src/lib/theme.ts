/**
 * Light/dark switching. The initial class is set by an inline script in app.html (before first
 * paint), so this only has to flip the class and remember the choice. The key matches the old
 * next-themes one ('ij-theme') so visitors keep their preference.
 */
const KEY = 'ij-theme';

export function toggleTheme() {
	const root = document.documentElement;
	const next = root.classList.contains('dark') ? 'light' : 'dark';
	root.classList.toggle('dark', next === 'dark');
	try {
		localStorage.setItem(KEY, next);
	} catch {
		/* storage unavailable: the change still applies for this page */
	}
}
