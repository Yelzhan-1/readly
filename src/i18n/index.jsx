import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useApp } from '../store/AppContext.jsx';
import en from '../locales/en.js';
import ru from '../locales/ru.js';
import kk from '../locales/kk.js';

const DICTS = { en, ru, kk };

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', native: 'Русский', short: 'RU' },
  { code: 'kk', label: 'Қазақша', native: 'Қазақша', short: 'ҚАЗ' },
];

const I18nContext = createContext(null);

function lookup(dict, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}

export function I18nProvider({ children }) {
  const { state, setLang } = useApp();
  const lang = DICTS[state.lang] ? state.lang : 'en';

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (path, vars) => {
      let val = lookup(DICTS[lang], path);
      if (typeof val !== 'string') val = lookup(en, path);
      if (typeof val !== 'string') {
        if (import.meta.env.DEV) console.warn('[i18n] missing key:', path);
        return path;
      }
      return interpolate(val, vars);
    },
    [lang]
  );

  const value = useMemo(() => ({ t, lang, setLang, languages: LANGUAGES }), [t, lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
