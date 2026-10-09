import BookOpen from '@lucide/svelte/icons/book-open';
import Users from '@lucide/svelte/icons/users';
import Tag from '@lucide/svelte/icons/tag';
import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import ScrollText from '@lucide/svelte/icons/scroll-text';
import HelpCircle from '@lucide/svelte/icons/circle-help';
import Sparkles from '@lucide/svelte/icons/sparkles';
import Mic from '@lucide/svelte/icons/mic';
import Newspaper from '@lucide/svelte/icons/newspaper';
import Images from '@lucide/svelte/icons/images';
import School from '@lucide/svelte/icons/school';
import Clock from '@lucide/svelte/icons/clock';
import Rss from '@lucide/svelte/icons/rss';
import Moon from '@lucide/svelte/icons/moon';
import FileText from '@lucide/svelte/icons/file-text';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import CloudDownload from '@lucide/svelte/icons/cloud-download';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import Bell from '@lucide/svelte/icons/bell';

/** Sidebar entries; `key` is the AdminNav message key. */
export const NAV = [
	{ key: 'dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
	{ key: 'media', href: '/admin/media', icon: Images },
	{ key: 'books', href: '/admin/books', icon: BookOpen },
	{ key: 'authors', href: '/admin/authors', icon: Users },
	{ key: 'categories', href: '/admin/categories', icon: Tag },
	{ key: 'topics', href: '/admin/topics', icon: LayoutGrid },
	{ key: 'malfuzat', href: '/admin/malfuzat', icon: ScrollText },
	{ key: 'masail', href: '/admin/masail', icon: HelpCircle },
	{ key: 'dua', href: '/admin/dua', icon: Sparkles },
	{ key: 'bayan', href: '/admin/bayan', icon: Mic },
	{ key: 'articles', href: '/admin/articles', icon: Newspaper },
	{ key: 'news', href: '/admin/news', icon: Rss },
	{ key: 'madrasah', href: '/admin/madrasah', icon: School },
	{ key: 'namazTimes', href: '/admin/namaz-times', icon: Clock },
	{ key: 'pages', href: '/admin/pages', icon: FileText },
	{ key: 'hijri', href: '/admin/hijri', icon: Moon },
	{ key: 'notifications', href: '/admin/notifications', icon: Bell },
	{ key: 'offlineSync', href: '/admin/offline-sync', icon: CloudDownload },
	{ key: 'admins', href: '/admin/admins', icon: ShieldCheck }
] as const;
