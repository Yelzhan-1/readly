import React from 'react';
import { useT } from '../../i18n/index.jsx';
import Button from './Button.jsx';

export function FeedbackCard({ tone = 'great', title, text }) {
  const icon =
    tone === 'great' ? '🌟' : tone === 'good' ? '👏' : tone === 'almost' ? '💡' : '🤗';
  return (
    <div className={`feedback feedback--${tone}`} role="status">
      <span className="feedback__emoji" aria-hidden="true">
        {icon}
      </span>
      <div>
        <div className="feedback__title">{title}</div>
        {text && <p className="feedback__text">{text}</p>}
      </div>
    </div>
  );
}

export function HintCard({ hints, used, onUse, onShowAnswer, showAnswer = false, answer = '' }) {
  const t = useT();
  if (!hints || !hints.length) return null;
  const nextIdx = used;
  const canUse = nextIdx < hints.length;

  return (
    <div className="stack" style={{ gap: 10 }}>
      {Array.from({ length: used }).map((_, i) => {
        const h = hints[i];
        return (
          <div className="hint" key={i}>
            <span aria-hidden="true">💡</span>
            <span>{t(h.key, h.vars)}</span>
          </div>
        );
      })}
      {showAnswer && (
        <div className="hint" style={{ background: 'var(--sun-soft)', color: '#8a6400' }}>
          <span aria-hidden="true">🔑</span>
          <span style={{ letterSpacing: '0.12em' }}>{String(answer).toUpperCase()}</span>
        </div>
      )}
      {!showAnswer && (
        <div className="row" style={{ justifyContent: 'center' }}>
          {canUse && (
            <Button size="sm" variant="violet" onClick={onUse}>
              💡 {t('exercise.hintBtn')}
            </Button>
          )}
          {used >= hints.length && (
            <Button size="sm" variant="ghost" onClick={onShowAnswer}>
              {t('exercise.showAnswer')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
