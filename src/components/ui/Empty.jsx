import React from 'react';
import { useT } from '../../i18n/index.jsx';
import Button from './Button.jsx';

export function EmptyState({ art = '🌙', title, sub, action = null, actionLabel = null, onAction = null }) {
  const t = useT();
  return (
    <div className="empty">
      <div className="empty__art" aria-hidden="true">
        {art}
      </div>
      <div className="empty__title">{title || t('errors.noProgress')}</div>
      {sub && <div>{sub}</div>}
      {(action || onAction) && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {action || actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingScreen({ title, sub = null }) {
  const t = useT();
  return (
    <div className="loading-screen">
      <div className="dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
        {title || t('session.creating')}
      </div>
      {sub && <div className="muted">{sub}</div>}
    </div>
  );
}

export function Skeleton({ height = 120, style = {} }) {
  return <div className="skeleton" style={{ height, ...style }} aria-hidden="true" />;
}
