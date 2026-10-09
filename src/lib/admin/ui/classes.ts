import { cn } from '#lib/utils.ts';

/** Shared class strings for native form controls, matching the shadcn "base-nova" look of the Next dashboard. */
const focus = 'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

export const inputCls = `h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 ${focus}`;

export const textareaCls = `block min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base md:text-sm transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 field-sizing-content ${focus}`;

/** The flat trigger of a select / combobox. */
export const triggerCls = `flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent pl-2.5 pr-2 text-sm whitespace-nowrap transition-colors dark:bg-input/30 ${focus}`;

export const sectionTitleCls = 'text-sm font-semibold text-muted-foreground uppercase tracking-wider';

export const popupCls = 'z-50 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10';

/** `inputCls` plus overrides; tailwind-merge makes a later width win over the default `w-full`. */
export const inp = (...extra: string[]) => cn(inputCls, ...extra);
