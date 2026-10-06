export interface CountryItem {
  name: string;
  nameAr: string;
  code: string; // ISO 2 code
  dialCode: string; // e.g. "+20"
  flag: string; // Emoji flag
}

export const COUNTRIES: CountryItem[] = [
  { name: 'Egypt', nameAr: 'مصر', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Kuwait', nameAr: 'الكويت', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Qatar', nameAr: 'قطر', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Bahrain', nameAr: 'البحرين', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Oman', nameAr: 'عمان', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Jordan', nameAr: 'الأردن', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'Iraq', nameAr: 'العراق', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'Lebanon', nameAr: 'لبنان', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'Palestine', nameAr: 'فلسطين', code: 'PS', dialCode: '+970', flag: '🇵🇸' },
  { name: 'Morocco', nameAr: 'المغرب', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Algeria', nameAr: 'الجزائر', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Tunisia', nameAr: 'تونس', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Libya', nameAr: 'ليبيا', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'Sudan', nameAr: 'السودان', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', nameAr: 'المملكة المتحدة', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', nameAr: 'كندا', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Germany', nameAr: 'ألمانيا', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', nameAr: 'فرنسا', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Italy', nameAr: 'إيطاليا', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Spain', nameAr: 'إسبانيا', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Turkey', nameAr: 'تركيا', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Netherlands', nameAr: 'هولندا', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Sweden', nameAr: 'السويد', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', nameAr: 'سويسرا', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Australia', nameAr: 'أستراليا', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Yemen', nameAr: 'اليمن', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
  { name: 'Syria', nameAr: 'سوريا', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Egypt (+20)
