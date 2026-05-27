import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  lang: typeof translations['id'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('id');
  const lang = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, lang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
