import type { Translator } from '#lib/i18n/index.ts';
import type { NotificationLinkType, NotificationTarget, PushNotificationDetail, SavePushNotificationRequest } from '#lib/types.ts';

// Mirrors the API's limits in NotificationService.Validate.
export const TITLE_MAX = 100;
export const BODY_MAX = 500;
export const EDITABLE = ['draft', 'scheduled', 'failed'];
export const EXPIRY_DAYS = ['1', '3', '7', '28'] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

export type When = 'now' | 'later';
export type Expiry = 'none' | 'keep' | (typeof EXPIRY_DAYS)[number];

/** ISO → the "YYYY-MM-DDTHH:mm" local string a datetime-local input expects. */
function toLocalInput(iso: string) {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Every field of the notification form, plus validation and the API payload. */
export class Draft {
	title = $state('');
	body = $state('');
	imageUrl = $state('');
	linkType = $state<NotificationLinkType>('none');
	screen = $state('/');
	url = $state('');
	target = $state<NotificationTarget>('all');
	sendPush = $state(true);
	showInInbox = $state(true);
	when = $state<When>('now');
	scheduledLocal = $state('');
	expiry = $state<Expiry>('none');
	highPriority = $state(true);
	sound = $state(true);
	analyticsLabel = $state('');
	dataRows = $state<{ key: string; value: string }[]>([]);
	advancedOpen = $state(false);

	/** `notification` is the saved row being edited; `template` prefills a new one ("Duplicate"). */
	constructor(
		private notification: PushNotificationDetail | null,
		template: PushNotificationDetail | null
	) {
		const s = notification ?? template;
		if (s) {
			this.title = s.title;
			this.body = s.body;
			this.imageUrl = s.imageUrl ?? '';
			this.linkType = s.linkType;
			this.screen = s.linkType === 'screen' ? (s.linkValue ?? '/') : '/';
			this.url = s.linkType === 'url' ? (s.linkValue ?? '') : '';
			this.target = s.target;
			this.sendPush = s.sendPush;
			this.showInInbox = s.showInInbox;
			this.highPriority = s.highPriority;
			this.sound = s.sound;
			this.analyticsLabel = s.analyticsLabel ?? '';
			this.dataRows = Object.entries(s.data ?? {}).map(([key, value]) => ({ key, value }));
			this.advancedOpen = !!(s.analyticsLabel || s.data || s.highPriority === false || s.sound === false);
		}
		if (notification?.status === 'scheduled') this.when = 'later';
		if (notification?.scheduledAt) this.scheduledLocal = toLocalInput(notification.scheduledAt);
		if (notification?.expiresAt) this.expiry = 'keep';
	}

	/** The payload, or the message to show when something is missing. */
	build(t: Translator): { payload: SavePushNotificationRequest } | { error: string } {
		if (!this.title.trim()) return { error: t('errTitle') };
		if (!this.body.trim()) return { error: t('errBody') };
		if (this.linkType === 'url' && !/^https?:\/\/\S+$/i.test(this.url.trim())) return { error: t('errUrl') };
		if (this.linkType === 'screen' && !this.screen.trim().startsWith('/')) return { error: t('errScreen') };
		if (!this.sendPush && !this.showInInbox) return { error: t('errDelivery') };

		const data = Object.fromEntries(this.dataRows.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]));
		const base = this.when === 'later' && this.scheduledLocal ? new Date(this.scheduledLocal).getTime() : Date.now();
		const expiresAt = this.expiry === 'none' ? null : this.expiry === 'keep' ? (this.notification?.expiresAt ?? null) : new Date(base + Number(this.expiry) * DAY_MS).toISOString();

		return {
			payload: {
				title: this.title.trim(),
				body: this.body.trim(),
				imageUrl: this.imageUrl || null,
				linkType: this.linkType,
				linkValue: this.linkType === 'screen' ? this.screen.trim() : this.linkType === 'url' ? this.url.trim() : null,
				data: Object.keys(data).length ? data : null,
				target: this.target,
				sendPush: this.sendPush,
				showInInbox: this.showInInbox,
				highPriority: this.highPriority,
				sound: this.sound,
				expiresAt,
				analyticsLabel: this.analyticsLabel.trim() || null
			}
		};
	}

	/** The schedule as ISO, or the message to show. */
	scheduledIso(t: Translator): { iso: string } | { error: string } {
		if (!this.scheduledLocal) return { error: t('errScheduleMissing') };
		const at = new Date(this.scheduledLocal);
		if (at.getTime() <= Date.now()) return { error: t('errSchedulePast') };
		return { iso: at.toISOString() };
	}
}
