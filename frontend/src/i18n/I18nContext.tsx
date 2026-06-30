import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import mr from './mr.json';

type TranslationKey = keyof typeof en;
type TranslationDict = Record<string, string>;

interface I18nContextType {
  language: 'en' | 'mr';
  setLanguage: (lang: 'en' | 'mr') => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<string, TranslationDict> = { en, mr };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'mr'>('en');

  useEffect(() => {
    AsyncStorage.getItem('appLanguage').then((saved) => {
      if (saved === 'en' || saved === 'mr') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: 'en' | 'mr') => {
    setLanguageState(lang);
    await AsyncStorage.setItem('appLanguage', lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[language] as Record<string, string>;
      let val = dict[key] || (en as Record<string, string>)[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          val = val.replace(`{{${k}}}`, String(v));
        });
      }
      return val;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
