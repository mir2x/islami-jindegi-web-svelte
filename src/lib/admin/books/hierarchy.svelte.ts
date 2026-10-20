/** What the book-editor layout's hierarchy sidebar shows; the chapter and subchapter pages publish it, so the sidebar outlives navigation between them. */
export const hierarchy = $state<{ bookId: string; currentId?: string; currentType?: 'chapter' | 'subchapter' }>({ bookId: '' });
