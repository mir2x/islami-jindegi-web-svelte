// Types used only by the admin dashboard.

export type MediaType = 'image' | 'audio' | 'document';

export interface MediaItem {
	id: string;
	fileName: string;
	url: string;
	type: MediaType;
	mimeType: string;
	size: number;
	width: number | null;
	height: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface Admin {
	id: string;
	email: string;
	displayName: string | null;
	createdAt: string;
}

/** How many items of a module reference an author / category. */
export interface ModuleUsage {
	module: string;
	items: number;
}

export interface ChapterListItem {
	id: string;
	title: string;
	position: number;
	bookId: string;
	bookTitle: string;
	subChapterCount: number;
}

export interface SubChapterListItem {
	id: string;
	title: string;
	position: number;
	chapterId: string;
	chapterTitle: string;
	bookId: string;
	bookTitle: string;
	parentSubChapterId: string | null;
}

export interface ChapterDetail {
	id: string;
	title: string;
	body: string | null;
	position: number;
	bookId: string;
	bookTitle: string;
	subChapters: { id: string; title: string; body: string | null; position: number; parentSubChapterId: string | null }[];
}

export interface SubChapterDetail {
	id: string;
	title: string;
	body: string | null;
	position: number;
	chapterId: string;
	chapterTitle: string;
	bookId: string;
	bookTitle: string;
	parentSubChapterId: string | null;
}

export interface HijriMonthSighting {
	id: string;
	countryCode: string;
	hijriYear: number;
	hijriMonth: number;
	monthNameEn: string;
	monthNameAr: string;
	monthNameBn: string;
	gregorianStartDate: string; // YYYY-MM-DD
	createdAt: string;
	updatedAt: string;
}

/** `GET /api/admin/offline/status`: one row per app offline database. */
export interface OfflineSnapshotInfo {
	url: string;
	schemaVersion: number;
	generatedAt: string;
	sha256: string;
	size: number;
	rawSize: number;
}

export interface OfflineFeatureStatus {
	feature: string;
	schemaVersion: number;
	lastChangedAt: string;
	pendingPushSince: string | null;
	lastPushedAt: string | null;
	resetAt: string;
	tombstonesSince: string;
	tombstoneCount: number;
	snapshot: OfflineSnapshotInfo | null;
}

/** A category as the topics admin sees it; setting fields are null when it has no settings row yet. */
export interface TopicAdminItem {
	categoryId: string;
	title: string;
	slug: string | null;
	groupId: string | null;
	position: number | null;
	hidden: boolean;
	icon: string | null;
	description: string | null;
	total: number;
	counts: Partial<Record<string, number>>;
}

export interface TopicGroupAdmin {
	id: string;
	title: string;
	position: number;
}

export interface TopicAdminResponse {
	groups: TopicGroupAdmin[];
	topics: TopicAdminItem[];
}

export interface TopicSettingPayload {
	/** Empty = generated from the category title. */
	slug: string | null;
	groupId: string | null;
	hidden: boolean;
	icon: string | null;
	description: string | null;
}

export type NotificationStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type NotificationTarget = 'all' | 'android' | 'ios';
export type NotificationLinkType = 'none' | 'screen' | 'url';

// The API omits null fields, so every nullable value is optional here.
export interface PushNotificationListItem {
	id: string;
	title: string;
	body: string;
	imageUrl?: string;
	target: NotificationTarget;
	sendPush: boolean;
	showInInbox: boolean;
	status: NotificationStatus;
	scheduledAt?: string;
	sentAt?: string;
	error?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PushNotificationDetail extends PushNotificationListItem {
	linkType: NotificationLinkType;
	linkValue?: string;
	data?: Record<string, string>;
	highPriority: boolean;
	sound: boolean;
	expiresAt?: string;
	analyticsLabel?: string;
	fcmMessageId?: string;
}

export interface SavePushNotificationRequest {
	title: string;
	body: string;
	imageUrl: string | null;
	linkType: NotificationLinkType;
	linkValue: string | null;
	data: Record<string, string> | null;
	target: NotificationTarget;
	sendPush: boolean;
	showInInbox: boolean;
	highPriority: boolean;
	sound: boolean;
	expiresAt: string | null;
	analyticsLabel: string | null;
}
