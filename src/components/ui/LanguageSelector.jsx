import React from 'react';
import { useI18n } from '../../i18n/index.jsx';

export default function LanguageSelector({ compact = false }) {
  const { lang, setLang, languages } = useI18n();
  return (
    <div className="lang-select" role="group" aria-label="Language">
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          aria-pressed={lang === l.code}
          onClick={() => setLang(l.code)}
          title={l.native}
        >
          {compact ? l.short : l.native}
        </button>
      ))}
    </div>
  );
}
