import React from 'react';
import { useApp } from '../../store/AppContext.jsx';

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`toast ${t.tone ? `toast--${t.tone}` : ''}`}
          onClick={() => dismissToast(t.id)}
        >
          <span className="toast__icon">{t.icon}</span>
          <span>{t.text}</span>
        </button>
      ))}
    </div>
  );
}
