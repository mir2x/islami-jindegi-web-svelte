import HelpCircle from '@lucide/svelte/icons/circle-help';
import Mic from '@lucide/svelte/icons/mic';
import Newspaper from '@lucide/svelte/icons/newspaper';
import Rss from '@lucide/svelte/icons/rss';
import ScrollText from '@lucide/svelte/icons/scroll-text';
import Sparkles from '@lucide/svelte/icons/sparkles';
import Users from '@lucide/svelte/icons/users';
import Tag from '@lucide/svelte/icons/tag';
import School from '@lucide/svelte/icons/school';
import Clock from '@lucide/svelte/icons/clock';
import FileText from '@lucide/svelte/icons/file-text';
import Moon from '@lucide/svelte/icons/moon';
import BookOpen from '@lucide/svelte/icons/book-open';
import Bell from '@lucide/svelte/icons/bell';
import ShieldCheck from '@lucide/svelte/icons/shield-check';

/** Icons of the admin empty states, by name (so configs stay plain data). */
export const EMPTY_ICONS = {
	newspaper: Newspaper,
	mic: Mic,
	sparkles: Sparkles,
	help: HelpCircle,
	scroll: ScrollText,
	rss: Rss,
	users: Users,
	tag: Tag,
	school: School,
	clock: Clock,
	file: FileText,
	moon: Moon,
	book: BookOpen,
	bell: Bell,
	shield: ShieldCheck
};
export type EmptyIconName = keyof typeof EMPTY_ICONS;
