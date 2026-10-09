// Bangla spellings are the canonical set shared 1:1 with the dotnet API's HijriService.MonthNames and the app's l10n: keep all three in sync.
export const HIJRI_MONTHS = [
	{ value: 1, en: 'Muharram', bn: 'মুহাররম' },
	{ value: 2, en: 'Safar', bn: 'সফর' },
	{ value: 3, en: "Rabi' al-Awwal", bn: 'রবিউল আউয়াল' },
	{ value: 4, en: "Rabi' al-Thani", bn: 'রবিউস সানি' },
	{ value: 5, en: 'Jumada al-Ula', bn: 'জুমাদাল উলা' },
	{ value: 6, en: 'Jumada al-Thani', bn: 'জুমাদাল উখরা' },
	{ value: 7, en: 'Rajab', bn: 'রজব' },
	{ value: 8, en: "Sha'ban", bn: 'শাবান' },
	{ value: 9, en: 'Ramadan', bn: 'রমাযান' },
	{ value: 10, en: 'Shawwal', bn: 'শাউয়াল' },
	{ value: 11, en: "Dhu al-Qi'dah", bn: 'যিলক্বদ' },
	{ value: 12, en: 'Dhu al-Hijjah', bn: 'যিলহাজ্জ' }
];

export const monthName = (month: number) => HIJRI_MONTHS.find((m) => m.value === month)?.en ?? '';

export const FILTER_COUNTRIES = ['BD', 'SA', 'PK', 'IN', 'AU', 'GB', 'US', 'MY', 'ID'];
export const FORM_COUNTRIES = [...FILTER_COUNTRIES, 'NG'];
