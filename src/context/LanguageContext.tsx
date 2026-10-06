import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, TRANSLATIONS, OFFICIAL_LOGO_URL } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  logoUrl: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'coach_matboly_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    // Default to Arabic or English based on browser/location preference, default 'ar'
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = language === 'ar' ? 'المتبولي | Coach Matboly' : 'Coach Matboly';

    // Ensure tab icon and apple touch icon are consistently set
    const updateIcon = (rel: string) => {
      let link: HTMLLinkElement | null = document.querySelector(`link[rel*='${rel}']`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = OFFICIAL_LOGO_URL;
    };
    updateIcon('icon');
    updateIcon('apple-touch-icon');
  }, [language]);

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        dir,
        isRTL,
        logoUrl: OFFICIAL_LOGO_URL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
