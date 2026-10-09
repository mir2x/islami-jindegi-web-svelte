import type { OfflineFeatureStatus } from '#lib/types.ts';

// Mirrors the API's OfflineSync:PushQuietMinutes / PushMaxWaitMinutes defaults. Only used to estimate when a
// pending push goes out; the worker also only runs once a minute.
const PUSH_QUIET_MS = 10 * 60_000;
const PUSH_MAX_WAIT_MS = 60 * 60_000;

export function minutesUntilPush(s: OfflineFeatureStatus, now: number): number | null {
	if (!s.pendingPushSince) return null;
	const quietAt = new Date(s.lastChangedAt).getTime() + PUSH_QUIET_MS;
	const capAt = new Date(s.pendingPushSince).getTime() + PUSH_MAX_WAIT_MS;
	return Math.max(0, Math.ceil((Math.min(quietAt, capAt) - now) / 60_000));
}

export const formatSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);
