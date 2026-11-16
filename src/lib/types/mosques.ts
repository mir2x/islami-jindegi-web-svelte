/** A mosque as OpenStreetMap describes it (`name` is what the mapper typed; the language variants are often empty). */
export interface Mosque {
	id: string;
	lat: number;
	lng: number;
	name: string;
	nameBn: string;
	nameEn: string;
	address: string;
	phone: string;
	website: string;
	hours: string;
	women: boolean;
}
