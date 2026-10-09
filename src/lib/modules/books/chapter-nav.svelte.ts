import { goto } from '$app/navigation';
import { page } from '$app/state';
import { SvelteSet } from 'svelte/reactivity';
import type { BookDetail, Chapter, SubChapter } from '#lib/types.ts';

export type ActiveContent = { kind: 'intro' } | { kind: 'chapter'; chapter: Chapter } | { kind: 'sub'; chapter: Chapter; sub: SubChapter };

// Chapter.subChapters arrives as a flat list (all nesting levels mixed), grouped only by
// parentSubChapterId. These helpers rebuild the tree.
export const topLevelSubs = (chapter: Chapter) => chapter.subChapters.filter((s) => !s.parentSubChapterId);
export const childrenOf = (chapter: Chapter, parentId: string) => chapter.subChapters.filter((s) => s.parentSubChapterId === parentId);

// Depth-first (parent immediately followed by its own children): used for prev/next and the default chapter.
const flattenSubs = (chapter: Chapter, subs: SubChapter[]): SubChapter[] => subs.flatMap((s) => [s, ...flattenSubs(chapter, childrenOf(chapter, s.id))]);

export const titleOf = (item: ActiveContent, introLabel: string) => (item.kind === 'intro' ? introLabel : item.kind === 'chapter' ? item.chapter.title : item.sub.title);

/** Which chapter/subchapter of a book is open, which tree nodes are expanded, and prev/next. The URL (`?chapter=&sub=`) mirrors it. */
export class ChapterNav {
	active = $state<ActiveContent>({ kind: 'intro' });
	expanded = new SvelteSet<string>();
	#book: BookDetail;

	constructor(book: BookDetail) {
		this.#book = book;
		const q = page.url.searchParams;
		const chapterId = q.get('chapter');
		const subId = q.get('sub');
		const first = book.chapters.find((c) => c.body || c.subChapters.some((s) => s.body));

		let start: ActiveContent = first ? { kind: 'chapter', chapter: first } : { kind: 'intro' };
		const owner = subId ? book.chapters.find((c) => c.id === chapterId || c.subChapters.some((s) => s.id === subId)) : undefined;
		const sub = owner?.subChapters.find((s) => s.id === subId);
		if (owner && sub) start = { kind: 'sub', chapter: owner, sub };
		else if (chapterId) {
			const c = book.chapters.find((x) => x.id === chapterId);
			if (c) start = { kind: 'chapter', chapter: c };
		}
		this.active = start;
		this.#expandTo(start);
	}

	get flat(): ActiveContent[] {
		const book = this.#book;
		return [
			...(book.excerpt ? [{ kind: 'intro' } as ActiveContent] : []),
			...book.chapters.flatMap((c) => [
				{ kind: 'chapter', chapter: c } as ActiveContent,
				...flattenSubs(c, topLevelSubs(c)).map((s) => ({ kind: 'sub', chapter: c, sub: s }) as ActiveContent)
			])
		];
	}
	get index() {
		const a = this.active;
		return this.flat.findIndex((item) => {
			if (item.kind !== a.kind) return false;
			if (a.kind === 'chapter' && item.kind === 'chapter') return item.chapter.id === a.chapter.id;
			if (a.kind === 'sub' && item.kind === 'sub') return item.sub.id === a.sub.id;
			return a.kind === 'intro';
		});
	}
	get prev() {
		return this.index > 0 ? this.flat[this.index - 1] : null;
	}
	get next() {
		const flat = this.flat;
		return this.index < flat.length - 1 ? flat[this.index + 1] : null;
	}

	/** What the reader shows now: the book's introduction, a chapter, or a subchapter. */
	get content(): { title: string; body: string | null } {
		const a = this.active;
		if (a.kind === 'intro') return { title: this.#book.title, body: this.#book.excerpt };
		return a.kind === 'chapter' ? { title: a.chapter.title, body: a.chapter.body } : { title: a.sub.title, body: a.sub.body };
	}

	/** A page with no body is likely a container: offer its direct children as an index. */
	get childIndex(): SubChapter[] {
		const a = this.active;
		if (a.kind === 'chapter') return topLevelSubs(a.chapter);
		return a.kind === 'sub' ? childrenOf(a.chapter, a.sub.id) : [];
	}

	isChapterActive = (id: string) => this.active.kind !== 'intro' && this.active.chapter.id === id;
	isSubActive = (id: string) => this.active.kind === 'sub' && this.active.sub.id === id;

	toggle = (id: string) => (this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id));

	go = (item: ActiveContent) => {
		this.active = item;
		this.#expandTo(item);
		this.#syncUrl();
	};
	pickChapter = (chapter: Chapter) => this.go({ kind: 'chapter', chapter });
	pickSub = (chapter: Chapter, sub: SubChapter) => this.go({ kind: 'sub', chapter, sub });
	intro = () => this.go({ kind: 'intro' });

	#expandTo(item: ActiveContent) {
		if (item.kind === 'chapter') this.expanded.add(item.chapter.id);
		else if (item.kind === 'sub') {
			this.expanded.add(item.chapter.id);
			if (childrenOf(item.chapter, item.sub.id).length > 0) this.expanded.add(item.sub.id);
			let parent = item.sub.parentSubChapterId;
			while (parent) {
				this.expanded.add(parent);
				parent = item.chapter.subChapters.find((s) => s.id === parent)?.parentSubChapterId ?? null;
			}
		}
	}

	#syncUrl() {
		const url = new URL(page.url.href);
		const a = this.active;
		url.searchParams.delete('chapter');
		url.searchParams.delete('sub');
		if (a.kind !== 'intro') url.searchParams.set('chapter', a.chapter.id);
		if (a.kind === 'sub') url.searchParams.set('sub', a.sub.id);
		if (url.href !== page.url.href) void goto(url, { replace: true, shallow: true, reset: false });
	}
}
