export type ToastKind = 'success' | 'error' | 'info';
export interface ToastItem {
	id: number;
	kind: ToastKind;
	message: string;
}

export const toasts = $state<ToastItem[]>([]);
let seq = 0;

function push(kind: ToastKind, message: string) {
	const id = ++seq;
	toasts.push({ id, kind, message });
	setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500);
}

export function dismiss(id: number) {
	const i = toasts.findIndex((t) => t.id === id);
	if (i >= 0) toasts.splice(i, 1);
}

export const toast = {
	success: (message: string) => push('success', message),
	error: (message: string) => push('error', message),
	info: (message: string) => push('info', message)
};
