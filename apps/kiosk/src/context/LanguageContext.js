import { createContext, useContext, useState } from 'react';
import it from '../locales/it';
import en from '../locales/en';

const translations = { it, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('kiosk_lang') || 'it'
  );

  const t = (key) => translations[lang]?.[key] ?? key;

  const setLanguage = (l) => {
    setLang(l);
    localStorage.setItem('kiosk_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
