export interface MadrasahInfoItem {
	id: string | null;
	label: string;
	info: string;
	position: number;
}

export interface MadrasahPhotoItem {
	id: string | null;
	title: string;
	imageUrl: string;
	position: number;
}

export interface MadrasahListItem {
	id: string;
	title: string;
	excerpt: string | null;
	position: number;
	infoCount: number;
	photoCount: number;
	isOfflineAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface MadrasahDetail {
	id: string;
	title: string;
	excerpt: string | null;
	introduction: string;
	position: number;
	infos: MadrasahInfoItem[];
	photos: MadrasahPhotoItem[];
	isOfflineAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface NamazTimeListItem {
	id: string;
	title: string;
	titleBn: string | null;
	/** Stable route key (e.g. 'fajr'); absent only from an API build that predates it. */
	slug?: string;
	position: number;
	createdAt: string;
	updatedAt: string;
}

export interface NamazTimeDetail {
	id: string;
	title: string;
	titleBn: string | null;
	slug?: string;
	masail: string;
	fazail: string | null;
	position: number;
	createdAt: string;
	updatedAt: string;
}
