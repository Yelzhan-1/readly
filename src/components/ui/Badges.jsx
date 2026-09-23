import React from 'react';
import { useT } from '../../i18n/index.jsx';

export function AchievementBadge({ icon, name, desc, locked = false }) {
  return (
    <div className={`badge ${locked ? 'badge--locked' : ''}`} title={desc || name}>
      <span className="badge__icon" aria-hidden="true">
        {locked ? '🔒' : icon}
      </span>
      <span>{locked ? name : name}</span>
      {desc && !locked && (
        <span style={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--ink-faint)' }}>{desc}</span>
      )}
    </div>
  );
}

export function StatTile({ value, label, icon = null }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__value">
        {icon && <span aria-hidden="true"> {icon}</span>}
        {value}
      </div>
      <div className="stat-tile__label">{label}</div>
    </div>
  );
}

export function Chip({ children, tone = '', icon = null }) {
  return (
    <span className={`chip ${tone ? `chip--${tone}` : ''}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

export function LevelChip({ levelId }) {
  const t = useT();
  return <Chip tone="violet">{t(`levels.${levelId}`)}</Chip>;
}
